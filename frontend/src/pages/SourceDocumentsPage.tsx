/**
 * SourceDocumentsPage.tsx
 * Source Documents - Document Management
 */

import { useState, useEffect, useMemo } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import {
    Search,
    FileText,
    RefreshCw,
    Trash2,
    Upload,
    FolderPlus,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    FileSpreadsheet,
    Presentation,
    File,
    Loader2,
    Move,
    CheckSquare
} from 'lucide-react';
import { documentsApi, TreeNode } from '../api/documents';
import { ingestApi } from '../api/ingest';
import { toast } from 'sonner';

type ParsingStatus = 'completed' | 'failed' | 'pending' | 'processing';

function SourceDocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [targetFolderId, setTargetFolderId] = useState<string>('root');

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await documentsApi.getTree();
            // Sort: Folders first, then Files by date desc
            const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
                return nodes.sort((a, b) => {
                    if (a.type === b.type) {
                        // If both are files, sort by date desc
                        if (a.type === 'file') {
                            return (b.uploadedAt || '').localeCompare(a.uploadedAt || '');
                        }
                        // If both are folders, sort by name asc
                        return a.name.localeCompare(b.name);
                    }
                    // Folders first
                    return a.type === 'folder' ? -1 : 1;
                }).map(node => ({
                    ...node,
                    children: node.children ? sortNodes(node.children) : []
                }));
            };
            setTreeData(sortNodes(data));
        } catch (e) {
            console.error("Failed to load documents", e);
            toast.error("문서 목록을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // ... (handleUpload, handleCreateFolder remain same)
    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        try {
            setIsUploading(true);
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                await ingestApi.uploadFile(file);
            }
            toast.success(`${selectedFiles.length}개 파일 업로드 완료`);
            await loadDocuments();
            setUploadOpen(false);
            setSelectedFiles(null);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('파일 업로드에 실패했습니다');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await documentsApi.createFolder(newFolderName);
            toast.success('폴더가 생성되었습니다');
            setNewFolderName('');
            setNewFolderOpen(false);
            await loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('폴더 생성에 실패했습니다');
        }
    };

    // Selection Logic
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set<string>();
            const traverse = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                    allIds.add(node.id);
                    if (node.children) traverse(node.children);
                });
            };
            traverse(treeData);
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;

        try {
            // Delete sequentially or parallel? Parallel is faster.
            await Promise.all(Array.from(selectedIds).map(id => documentsApi.deleteDocument(id)));
            toast.success('삭제되었습니다');
            setSelectedIds(new Set());
            await loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('삭제 중 오류가 발생했습니다');
        }
    };

    const handleBulkMove = async () => {
        if (selectedIds.size === 0) return;

        try {
            const parentId = targetFolderId === 'root' ? null : targetFolderId;
            await Promise.all(Array.from(selectedIds).map(id => documentsApi.updateDocument(id, { parent_id: parentId })));
            toast.success('이동되었습니다');
            setMoveOpen(false);
            setSelectedIds(new Set());
            await loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('이동 중 오류가 발생했습니다');
        }
    };

    // Helper to get all folders for Move dialog
    const getAllFolders = useMemo(() => {
        const folders: { id: string, name: string }[] = [];
        const traverse = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                if (node.type === 'folder') {
                    folders.push({ id: node.id, name: node.name });
                    if (node.children) traverse(node.children);
                }
            });
        };
        traverse(treeData);
        return folders;
    }, [treeData]);

    // ... (handleReparse, toggleFolder, getFileIcon, getParsingStatusBadge remain similar)
    const handleReparse = async (fileId: string) => {
        try {
            await documentsApi.reindexDocument(fileId);
            toast.success('재파싱을 시작했습니다');
            // Optimistic update or reload? Reload is safer for status
            loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('재파싱 요청에 실패했습니다');
        }
    };

    const toggleFolder = (nodeId: string) => {
        const toggleNode = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId && node.type === 'folder') {
                    return { ...node, expanded: !node.expanded };
                }
                if (node.children) {
                    return { ...node, children: toggleNode(node.children) };
                }
                return node;
            });
        };
        setTreeData(toggleNode(treeData));
    };

    const getFileIcon = (extension?: string) => {
        if (!extension) return <FileText className="h-4 w-4 text-[#9AA0A6]" />;
        const ext = extension.toLowerCase();
        if (['xlsx', 'xls'].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-[#0E7A4E]" />;
        if (['pptx', 'ppt'].includes(ext)) return <Presentation className="h-4 w-4 text-[#D0362D]" />;
        if (['docx', 'doc'].includes(ext)) return <FileText className="h-4 w-4 text-[#0B57D0]" />;
        if (ext === 'hwp') return <File className="h-4 w-4 text-[#0B57D0]" />;
        if (ext === 'pdf') return <FileText className="h-4 w-4 text-[#D0362D]" />;
        return <FileText className="h-4 w-4 text-[#9AA0A6]" />;
    };

    const getParsingStatusBadge = (status?: ParsingStatus) => {
        if (!status) return null;
        switch (status) {
            case 'completed': return <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">완료</Badge>;
            case 'failed': return <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">실패</Badge>;
            default: return <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">대기중</Badge>;
        }
    };

    const renderTree = (nodes: TreeNode[], level: number = 0): React.ReactNode[] => {
        const rows: React.ReactNode[] = [];
        nodes.forEach(node => {
            if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase()) && node.type === 'file') return;

            const isSelected = selectedIds.has(node.id);

            if (node.type === 'folder') {
                rows.push(
                    <tr key={node.id} className={`hover:bg-[#F7F7F8] transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3 w-10">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(node.id)} />
                        </td>
                        <td onClick={() => toggleFolder(node.id)} className="px-6 py-3 cursor-pointer">
                            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2">
                                {node.expanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                {node.expanded ? <FolderOpen className="h-4 w-4 text-[#0B57D0]" /> : <Folder className="h-4 w-4 text-[#0B57D0]" />}
                                <span className="font-medium text-[#1F1F1F]">{node.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3 text-right"></td>
                    </tr>
                );
                if (node.expanded && node.children) {
                    rows.push(...renderTree(node.children, level + 1));
                }
            } else {
                const fileExtension = node.name.split('.').pop()?.toLowerCase();
                rows.push(
                    <tr key={node.id} className={`hover:bg-[#F7F7F8] transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3 w-10">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(node.id)} />
                        </td>
                        <td className="px-6 py-3">
                            <div style={{ paddingLeft: `${(level * 24) + 20}px` }} className="flex items-center gap-2">
                                {getFileIcon(fileExtension)}
                                <span className="text-[#1F1F1F]">{node.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-3 text-[#424242] font-mono text-[0.8125rem]">
                            {node.uploadedAt ? new Date(node.uploadedAt).toLocaleDateString('ko-KR') : '-'}
                        </td>
                        <td className="px-6 py-3">
                            {getParsingStatusBadge(node.parsingStatus as ParsingStatus)}
                        </td>
                        <td className="px-6 py-3 text-[#424242] font-mono text-[0.8125rem]">
                            {node.fileSize}
                        </td>
                        <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleReparse(node.id)} title="Re-Parse">
                                    <RefreshCw className="h-4 w-4 text-gray-400 hover:text-[#0B57D0]" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                );
            }
        });
        return rows;
    };

    return (
        <EnterpriseLayout>
            <div className="h-full flex flex-col bg-white">
                <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Source Documents</h1>
                        <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">원본 문서 파싱 및 관리</p>
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 mr-2">{selectedIds.size} selected</span>
                            <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Move className="h-4 w-4" /> Move
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>문서 이동</DialogTitle>
                                        <DialogDescription>선택한 항목을 이동할 폴더를 선택하세요.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label>대상 폴더</Label>
                                        <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="폴더 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="root">/(Root)</SelectItem>
                                                {getAllFolders.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleBulkMove}>이동</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button variant="destructive" size="sm" className="gap-2" onClick={handleBulkDelete}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6 bg-[#F7F7F8]">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
                        <Input
                            placeholder="파일명 또는 폴더명으로 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <FolderPlus className="h-4 w-4" /> New Folder
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>새 폴더 생성</DialogTitle>
                                    <DialogDescription>문서를 정리할 새 폴더의 이름을 입력하세요.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">이름</Label>
                                        <Input id="name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" placeholder="폴더명 입력" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleCreateFolder}>생성</Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2 bg-[#0B57D0] hover:bg-[#0B57D0]/90">
                                    <Upload className="h-4 w-4" /> Upload Documents
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>문서 업로드</DialogTitle>
                                    <DialogDescription>분석할 PDF, HWP, DOCX 파일을 선택하세요.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp" onChange={(e) => setSelectedFiles(e.target.files)} />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleUpload} disabled={isUploading}>
                                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />업로드 중...</> : '업로드'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#0B57D0]" />
                            </div>
                        ) : treeData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">등록된 문서가 없습니다.</div>
                        ) : (
                            <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
                                <table className="w-full text-left text-[0.875rem]">
                                    <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <Checkbox
                                                    checked={treeData.length > 0 && selectedIds.size === treeData.reduce((acc, n) => acc + 1 + (n.children ? n.children.length : 0), 0)} // Approximate check
                                                    onCheckedChange={(c: boolean | 'indeterminate') => handleSelectAll(c === true)}
                                                />
                                            </th>
                                            <th className="px-6 py-3 font-medium text-[#424242]">이름</th>
                                            <th className="px-6 py-3 font-medium text-[#424242] w-36">업로드 일자</th>
                                            <th className="px-6 py-3 font-medium text-[#424242] w-28">파싱 상태</th>
                                            <th className="px-6 py-3 font-medium text-[#424242] w-28">파일 크기</th>
                                            <th className="px-6 py-3 font-medium text-[#424242] w-48 text-right">액션</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {renderTree(treeData)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EnterpriseLayout>
    );
}

export default SourceDocumentsPage;
