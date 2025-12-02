/**
 * SourceDocumentsPage.tsx
 * Source Documents - Document Management
 */

import { useState, useEffect } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
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
    Filter
} from 'lucide-react';
import { documentsApi, SourceDocument, TreeNode } from '../api/documents';
import { ingestApi } from '../api/ingest';
import { toast } from 'sonner';

type ParsingStatus = 'completed' | 'failed' | 'pending' | 'processing';

function SourceDocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await documentsApi.getTree();
            setTreeData(data);
        } catch (e) {
            console.error("Failed to load documents", e);
            toast.error("문서 목록을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        try {
            setIsUploading(true);
            // Upload files sequentially using ingestApi (existing logic)
            // Note: ingestApi currently takes one file at a time.
            // We will use the default workspace (no project ID) as per instructions.

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                await ingestApi.uploadFile(file); // No project ID -> Default workspace
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

    const handleDeleteFile = async (fileId: string) => {
        if (!confirm('파일을 삭제하시겠습니까?')) return;

        try {
            await documentsApi.deleteDocument(fileId);
            toast.success('파일이 삭제되었습니다');
            await loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('삭제에 실패했습니다');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm('폴더와 모든 하위 항목이 삭제됩니다. 계속하시겠습니까?')) return;

        try {
            await documentsApi.deleteDocument(folderId);
            toast.success('폴더가 삭제되었습니다');
            await loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error('폴더 삭제에 실패했습니다');
        }
    };

    const handleReparse = async (fileId: string) => {
        try {
            await documentsApi.reindexDocument(fileId);

            const updateNode = (nodes: TreeNode[]): TreeNode[] => {
                return nodes.map(node => {
                    if (node.id === fileId) {
                        return { ...node, parsingStatus: 'pending' as ParsingStatus };
                    }
                    if (node.children) {
                        return { ...node, children: updateNode(node.children) };
                    }
                    return node;
                });
            };

            setTreeData(updateNode(treeData));
            toast.success('재파싱을 시작했습니다');
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

        if (ext === 'xlsx' || ext === 'xls') {
            return <FileSpreadsheet className="h-4 w-4 text-[#0E7A4E]" />;
        } else if (ext === 'pptx' || ext === 'ppt') {
            return <Presentation className="h-4 w-4 text-[#D0362D]" />;
        } else if (ext === 'docx' || ext === 'doc') {
            return <FileText className="h-4 w-4 text-[#0B57D0]" />;
        } else if (ext === 'hwp') {
            return <File className="h-4 w-4 text-[#0B57D0]" />;
        } else if (ext === 'pdf') {
            return <FileText className="h-4 w-4 text-[#D0362D]" />;
        } else {
            return <FileText className="h-4 w-4 text-[#9AA0A6]" />;
        }
    };

    const getParsingStatusBadge = (status?: ParsingStatus) => {
        if (!status) return null;

        switch (status) {
            case 'completed':
                return <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">완료</Badge>;
            case 'failed':
                return <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">실패</Badge>;
            case 'pending':
            case 'processing':
                return <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">대기중</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderTree = (nodes: TreeNode[], level: number = 0): React.ReactNode[] => {
        const rows: React.ReactNode[] = [];

        nodes.forEach(node => {
            // Filter logic
            if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                // If folder, check children? For now simple filter
                if (node.type === 'file') return;
                // If folder matches, show it. If not, check children.
                // This simple filter might hide children if parent doesn't match.
                // For MVP, let's just filter files at root or show all if folder matches.
            }

            if (node.type === 'folder') {
                rows.push(
                    <tr key={node.id} className="hover:bg-[#F7F7F8] transition-colors cursor-pointer">
                        <td onClick={() => toggleFolder(node.id)} className="px-6 py-3">
                            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2">
                                {node.expanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                {node.expanded ? <FolderOpen className="h-4 w-4 text-[#0B57D0]" /> : <Folder className="h-4 w-4 text-[#0B57D0]" />}
                                <span className="font-medium text-[#1F1F1F]">{node.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3"><span className="text-gray-400">—</span></td>
                        <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteFolder(node.id); }}>
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </Button>
                        </td>
                    </tr>
                );

                if (node.expanded && node.children) {
                    rows.push(...renderTree(node.children, level + 1));
                }
            } else {
                const fileExtension = node.name.split('.').pop()?.toLowerCase();
                rows.push(
                    <tr key={node.id} className="hover:bg-[#F7F7F8] transition-colors">
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
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(node.id)} title="Delete">
                                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
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
                {/* Header */}
                <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Source Documents</h1>
                        <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">
                            원본 문서 파싱 및 관리
                        </p>
                    </div>
                </div>

                {/* Search & Actions */}
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
                        {/* New Folder Dialog */}
                        <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <FolderPlus className="h-4 w-4" />
                                    New Folder
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>새 폴더 생성</DialogTitle>
                                    <DialogDescription>
                                        문서를 정리할 새 폴더의 이름을 입력하세요.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            이름
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            className="col-span-3"
                                            placeholder="폴더명 입력"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleCreateFolder}>생성</Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Upload Dialog */}
                        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2 bg-[#0B57D0] hover:bg-[#0B57D0]/90">
                                    <Upload className="h-4 w-4" />
                                    Upload Documents
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>문서 업로드</DialogTitle>
                                    <DialogDescription>
                                        분석할 PDF, HWP, DOCX 파일을 선택하세요.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp"
                                        onChange={(e) => setSelectedFiles(e.target.files)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleUpload} disabled={isUploading}>
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                업로드 중...
                                            </>
                                        ) : (
                                            '업로드'
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#0B57D0]" />
                            </div>
                        ) : treeData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                등록된 문서가 없습니다.
                            </div>
                        ) : (
                            <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
                                <table className="w-full text-left text-[0.875rem]">
                                    <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
                                        <tr>
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
