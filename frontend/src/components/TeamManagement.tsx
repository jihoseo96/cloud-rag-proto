
import React, { useState, useEffect, useRef } from 'react';
import {
  listGroups,
  createChatApi,
  listChats,
  uploadDocument,
  listDocuments,
  listAnswers,

  getGroupInstructions,
  createGroupInstruction,
  updateGroupInstruction,
  deleteGroupInstruction,
  Group,
  Chat,
  GroupInstructionDto,
} from '../lib/api';
import { ArrowLeft, Plus, Users, Trash2, UserPlus, Mail, Menu, X, BarChart3, FileText, MessageSquare, Upload, Download, TrendingUp, Clock, Folder, FolderPlus, ChevronRight, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import DocumentViewer from './DocumentViewer';
import { GroupInstructionEditDialog } from './GroupInstructionEditDialog';

interface Team {
  id: string;
  name: string;
  memberCount: number;
  members?: Member[];
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  uploader?: string;
  date?: string;
  parentId: string | null;
}

interface StandardAnswer {
  id: string;
  teamId: string;
  question: string;
  answer: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  chatId: string;
  messageId: string;
}

interface TeamManagementProps {
  onBack: () => void;
  teams: Team[];
  onCreateTeam: (name: string) => void;
  onDeleteTeam: (teamId: string) => void;
  initialSelectedTeam?: string | null;
  initialSidebarCollapsed?: boolean;
  initialShowCreateDialog?: boolean;
  standardAnswers: StandardAnswer[];
  onUpdateStandardAnswer: (id: string, status: 'approved' | 'rejected') => void;
}

export default function TeamManagement({
  onBack,
  teams,
  onCreateTeam,
  onDeleteTeam,
  initialSelectedTeam = null,
  initialSidebarCollapsed = false,
  initialShowCreateDialog = false,
  standardAnswers,
  onUpdateStandardAnswer
}: TeamManagementProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(initialSelectedTeam);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(initialShowCreateDialog);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialSidebarCollapsed);

  // File management states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openedFile, setOpenedFile] = useState<FileItem | null>(null);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [answers, setAnswers] = useState<StandardAnswer[]>([]);

  const [prompts, setPrompts] = useState<GroupInstructionDto[]>([]);
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<GroupInstructionDto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents, answers, and instruction from backend
  useEffect(() => {
    if (!selectedTeam) return;

    const loadData = async () => {
      try {
        // Load Documents
        const docs = await listDocuments({ groupId: selectedTeam });
        const mappedFiles: FileItem[] = docs.map(d => ({
          id: d.id,
          name: d.title,
          type: 'file',
          size: 'Unknown',
          uploader: 'Unknown',
          date: new Date(d.created_at).toLocaleDateString(),
          parentId: null
        }));
        setFileItems(mappedFiles);

        // Load Answers
        const backendAnswers = await listAnswers({ groupId: selectedTeam });
        const mappedAnswers: StandardAnswer[] = backendAnswers.map(a => ({
          id: a.id,
          teamId: a.group_id || '',
          question: a.question,
          answer: a.answer,
          requestedBy: a.created_by || 'Unknown',
          requestedAt: a.created_at ? new Date(a.created_at) : new Date(),
          status: a.status as 'pending' | 'approved' | 'rejected',
          approvedBy: a.reviewed_by || undefined,
          approvedAt: a.updated_at ? new Date(a.updated_at) : undefined,
          chatId: '',
          messageId: ''
        }));
        setAnswers(mappedAnswers);

        // 3. Load Group Instructions
        try {
          const instructions = await getGroupInstructions(selectedTeam);
          setPrompts(instructions);
        } catch (error) {
          console.error('Failed to load instructions', error);
          setPrompts([]);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, [selectedTeam]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTeam) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('group_id', selectedTeam);

      await uploadDocument(formData);

      // Refresh list
      const docs = await getDocuments({ groupId: selectedTeam });
      const mappedFiles: FileItem[] = docs.map(d => ({
        id: d.id,
        name: d.title,
        type: 'file',
        size: 'Unknown',
        uploader: 'Unknown',
        date: new Date(d.created_at).toLocaleDateString(),
        parentId: null
      }));
      setFileItems(mappedFiles);

    } catch (e) {
      console.error('Upload failed', e);
      alert('파일 업로드 실패');
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setSelectedTeam(initialSelectedTeam);
  }, [initialSelectedTeam]);

  useEffect(() => {
    setIsSidebarCollapsed(initialSidebarCollapsed);
  }, [initialSidebarCollapsed]);

  useEffect(() => {
    setIsCreateDialogOpen(initialShowCreateDialog);
  }, [initialShowCreateDialog]);

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      onCreateTeam(newTeamName);
      setNewTeamName('');
      setNewTeamDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: newFolderName,
        type: 'folder',
        parentId: currentFolderId
      };
      setFileItems(prev => [...prev, newFolder]);
      setNewFolderName('');
      setIsCreateFolderDialogOpen(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleFileClick = (file: FileItem) => {
    // Check if it's an Office file or PDF
    const viewableExtensions = ['.xlsx', '.docx', '.pptx', '.xls', '.doc', '.ppt', '.pdf'];
    const isViewableFile = viewableExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (isViewableFile) {
      setOpenedFile(file);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    // Delete item and all its children recursively
    const deleteRecursive = (id: string) => {
      const children = fileItems.filter(item => item.parentId === id);
      children.forEach(child => deleteRecursive(child.id));
      setFileItems(prev => prev.filter(item => item.id !== id));
    };
    deleteRecursive(itemId);
  };

  const handleSaveInstruction = async (title: string, content: string) => {
    if (!selectedTeam) return;
    try {
      if (editingInstruction?.id) {
        await updateGroupInstruction(selectedTeam, editingInstruction.id, title, content);
      } else {
        await createGroupInstruction(selectedTeam, title, content);
      }

      // Refresh
      const instructions = await getGroupInstructions(selectedTeam);
      setPrompts(instructions);
      setIsInstructionDialogOpen(false);
    } catch (error) {
      console.error('Failed to save instruction', error);
      alert('프롬프트 저장 실패');
    }
  };

  const handleDeleteInstruction = async (instructionId: string) => {
    if (!selectedTeam || !confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteGroupInstruction(selectedTeam, instructionId);
      // Refresh
      const instructions = await getGroupInstructions(selectedTeam);
      setPrompts(instructions);
    } catch (error) {
      console.error('Failed to delete instruction', error);
      alert('삭제 실패');
    }
  };

  const openInstructionDialog = (instruction?: GroupInstructionDto) => {
    if (instruction) {
      setEditingInstruction(instruction);
    } else {
      setEditingInstruction(null);
    }
    setIsInstructionDialogOpen(true);
  };

  // Get current folder path for breadcrumb
  const getFolderPath = (folderId: string | null): FileItem[] => {
    if (!folderId) return [];
    const folder = fileItems.find(item => item.id === folderId);
    if (!folder) return [];
    return [...getFolderPath(folder.parentId), folder];
  };

  // Get items in current folder
  const currentItems = fileItems
    .filter(item => item.parentId === currentFolderId)
    .sort((a, b) => {
      // Folders first, then files
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

  const folderPath = getFolderPath(currentFolderId);

  const selectedTeamData = teams.find(t => t.id === selectedTeam);

  // If a file is opened, show the document viewer
  if (openedFile) {
    return <DocumentViewer file={openedFile} onBack={() => setOpenedFile(null)} />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Team List */}
      <div className={`${isSidebarCollapsed ? 'w-0' : 'w-80'} border-r border-[#E9EDF7] bg-white flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-[#E9EDF7]">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2 text-[#718096] hover:text-[#0EA5E9]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-[24px] font-semibold text-[#1b2559] mb-2">팀 관리</h1>
          <p className="text-[14px] text-[#718096]">팀을 생성하고 멤버를 관리하세요</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`w - full text - left p - 4 rounded - xl transition - all ${selectedTeam === team.id
                  ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]'
                  : 'hover:bg-[#f0f9ff] border-l-4 border-transparent'
                  } `}
              >
                <div className="flex items-start gap-3">
                  <Users className={`w - 5 h - 5 mt - 1 ${selectedTeam === team.id ? 'text-[#0EA5E9]' : 'text-[#718096]'} `} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold mb-1 truncate text-[#1b2559]">
                      {team.name}
                    </h3>
                    <p className="text-[12px] text-[#718096]">{team.memberCount}명의 멤버</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#E9EDF7]">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 팀 생성
          </Button>
        </div>
      </div>

      {/* Main Content - Team Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTeamData ? (
          <>
            <div className="border-b border-[#E9EDF7]">
              <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]"
                    >
                      {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </Button>
                    <div>
                      <h2 className="text-[28px] font-semibold text-[#1b2559] mb-2">{selectedTeamData.name}</h2>
                      <p className="text-[14px] text-[#718096]">{selectedTeamData.memberCount}명의 멤버</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onDeleteTeam(selectedTeamData.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    팀 삭제
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent px-8 h-12">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0EA5E9] rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#0EA5E9] text-[#718096]"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    대시보드
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0EA5E9] rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#0EA5E9] text-[#718096]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    파일
                  </TabsTrigger>
                  <TabsTrigger
                    value="answers"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0EA5E9] rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#0EA5E9] text-[#718096]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Answer Card
                    {selectedTeamData && answers.filter(sa => sa.status === 'pending').length > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                        {answers.filter(sa => sa.status === 'pending').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="prompts"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0EA5E9] rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#0EA5E9] text-[#718096]"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    프롬프트
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0EA5E9] rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#0EA5E9] text-[#718096]"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    멤버
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 250px)' }}>
                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="p-8 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <Card className="p-6 border-[#E9EDF7]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-[#0EA5E9]" />
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                            +12%
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#718096] mb-1">메시지 사용량</p>
                        <p className="text-[24px] font-semibold text-[#1b2559]">1,247</p>
                      </Card>

                      <Card className="p-6 border-[#E9EDF7]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#0EA5E9]" />
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                            +8%
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#718096] mb-1">업로드된 파일</p>
                        <p className="text-[24px] font-semibold text-[#1b2559]">87</p>
                      </Card>

                      <Card className="p-6 border-[#E9EDF7]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-[#0EA5E9]" />
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                            +3
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#718096] mb-1">신규 멤버</p>
                        <p className="text-[24px] font-semibold text-[#1b2559]">3</p>
                      </Card>

                      <Card className="p-6 border-[#E9EDF7]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </div>
                          <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                            -5
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#718096] mb-1">삭제된 파일</p>
                        <p className="text-[24px] font-semibold text-[#1b2559]">12</p>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="p-6 border-[#E9EDF7]">
                        <h3 className="text-[16px] font-semibold text-[#1b2559] mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#0EA5E9]" />
                          최근 활동
                        </h3>
                        <div className="space-y-4">
                          {[
                            { user: 'Sarah Kim', action: '케팅 전략.pdf 업로드', time: '5분 전' },
                            { user: 'John Smith', action: '신규 프롬프트 생성', time: '1시간 전' },
                            { user: 'Adela Parkson', action: '팀 멤버 초대', time: '2시간 전' },
                            { user: 'David Lee', action: '분석 리포트.xlsx 업로드', time: '3시간 전' },
                          ].map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-[#E9EDF7] last:border-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
                                {activity.user.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[#1b2559]">{activity.user}</p>
                                <p className="text-[12px] text-[#718096]">{activity.action}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-[#718096] flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-6 border-[#E9EDF7]">
                        <h3 className="text-[16px] font-semibold text-[#1b2559] mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0EA5E9]" />
                          최근 파일
                        </h3>
                        <div className="space-y-3">
                          {[
                            { name: '마케팅 전략.pdf', size: '2.4 MB', date: '오늘' },
                            { name: '분석 리포트.xlsx', size: '1.8 MB', date: '어제' },
                            { name: '디자인 가이드.fig', size: '5.2 MB', date: '2일 전' },
                            { name: '회의록.docx', size: '156 KB', date: '3일 전' },
                          ].map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f4f7fe] transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-[#0EA5E9]" />
                                </div>
                                <div>
                                  <p className="text-[13px] text-[#1b2559] font-medium">{file.name}</p>
                                  <p className="text-[11px] text-[#718096]">{file.size}</p>
                                </div>
                              </div>
                              <p className="text-[11px] text-[#718096]">{file.date}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Files Tab */}
                  <TabsContent value="files" className="p-8 m-0">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-[20px] font-semibold text-[#1b2559] mb-2">팀 파일</h3>
                        <p className="text-[14px] text-[#718096]">팀에서 공유된 모든 파일을 관리하세요</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#f0f9ff]"
                          onClick={() => setIsCreateFolderDialogOpen(true)}
                        >
                          <FolderPlus className="w-4 h-4 mr-2" />
                          폴더 생성
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
                          onClick={handleFileUploadClick}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          파일 업로드
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="mb-4">
                      <Breadcrumb>
                        <BreadcrumbList>
                          <BreadcrumbItem>
                            <button
                              onClick={() => setCurrentFolderId(null)}
                              className="cursor-pointer text-[#0EA5E9] hover:text-[#0EA5E9] hover:underline"
                            >
                              루트
                            </button>
                          </BreadcrumbItem>
                          {folderPath.map((folder, idx) => (
                            <div key={folder.id} className="flex items-center gap-2">
                              <BreadcrumbSeparator>
                                <ChevronRight className="w-4 h-4" />
                              </BreadcrumbSeparator>
                              <BreadcrumbItem>
                                {idx === folderPath.length - 1 ? (
                                  <BreadcrumbPage className="text-[#1b2559]">{folder.name}</BreadcrumbPage>
                                ) : (
                                  <button
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    className="cursor-pointer text-[#0EA5E9] hover:text-[#0EA5E9] hover:underline"
                                  >
                                    {folder.name}
                                  </button>
                                )}
                              </BreadcrumbItem>
                            </div>
                          ))}
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>

                    <Card className="border-[#E9EDF7]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>크기</TableHead>
                            <TableHead>업로드한 사람</TableHead>
                            <TableHead>업로드 날짜</TableHead>
                            <TableHead className="text-right">동작</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-[#718096]">
                                이 폴더는 비어있습니다
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentItems.map((item) => (
                              <TableRow
                                key={item.id}
                                className="cursor-pointer hover:bg-[#f4f7fe]"
                                onClick={() => item.type === 'folder' ? handleFolderClick(item.id) : handleFileClick(item)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                                      {item.type === 'folder' ? (
                                        <Folder className="w-4 h-4 text-[#0EA5E9]" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-[#0EA5E9]" />
                                      )}
                                    </div>
                                    <span className="text-[14px] text-[#1b2559] font-medium">{item.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-[13px] text-[#718096]">
                                  {item.type === 'file' ? item.size : '-'}
                                </TableCell>
                                <TableCell className="text-[13px] text-[#718096]">
                                  {item.type === 'file' ? item.uploader : '-'}
                                </TableCell>
                                <TableCell className="text-[13px] text-[#718096]">
                                  {item.type === 'file' ? item.date : '-'}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      {item.type === 'file' && (
                                        <>
                                          <DropdownMenuItem className="cursor-pointer">
                                            <Download className="w-4 h-4 mr-2" />
                                            다운로드
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteItem(item.id);
                                        }}
                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        삭제
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>

                  {/* Answers Tab */}
                  <TabsContent value="answers" className="p-8 m-0">
                    <div className="mb-6">
                      <h3 className="text-[20px] font-semibold text-[#1b2559] mb-2">Answer Card</h3>
                      <p className="text-[14px] text-[#718096]">팀 채팅에서 등록된 표준 답변을 승인하거나 거부하세요</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {answers
                        .map((answer, idx) => (
                          <Card key={idx} className="p-5 border-[#E9EDF7] hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-[#1b2559] mb-1">{answer.question}</h4>
                                <p className="text-[13px] text-[#718096]">{answer.answer}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  answer.status === 'approved'
                                    ? 'border-green-500 text-green-600 ml-2'
                                    : answer.status === 'rejected'
                                      ? 'border-red-500 text-red-600 ml-2'
                                      : 'border-amber-500 text-amber-600 ml-2'
                                }
                              >
                                {answer.status === 'approved' ? '승인됨' : answer.status === 'rejected' ? '거부됨' : '대기중'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[12px] text-[#718096]">
                              <span>요청자: {answer.requestedBy}</span>

                              {answer.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => onUpdateStandardAnswer(answer.id, 'approved')}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    승인
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => onUpdateStandardAnswer(answer.id, 'rejected')}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    거부
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-[11px]">
                                  {answer.approvedBy && answer.approvedAt && (
                                    <span className="text-[#718096]">
                                      {answer.status === 'approved' ? '승인자' : '처리자'}: {answer.approvedBy} · {new Date(answer.approvedAt).toLocaleDateString('ko-KR')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Prompts Tab */}
                  <TabsContent value="prompts" className="p-8 m-0">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-[20px] font-semibold text-[#1b2559] mb-2">Group Prompts</h3>
                        <p className="text-[14px] text-[#718096]">팀 멤버들이 사용할 공통 프롬프트를 관리하세요</p>
                      </div>
                      <Button
                        onClick={() => openInstructionDialog()}
                        className="bg-[#4318FF] hover:bg-[#3311CC] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        프롬프트 추가
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {prompts.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">등록된 프롬프트가 없습니다.</p>
                          <Button variant="link" onClick={() => openInstructionDialog()}>
                            첫 번째 프롬프트 만들기
                          </Button>
                        </div>
                      ) : (
                        prompts.map((prompt) => (
                          <Card key={prompt.id} className="p-6 border-[#E9EDF7]">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-[16px] font-bold text-[#1b2559] mb-1">{prompt.title}</h4>
                                <p className="text-[12px] text-[#A3AED0]">
                                  Last updated: {new Date(prompt.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openInstructionDialog(prompt)}
                                >
                                  수정하기
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => handleDeleteInstruction(prompt.id)}
                                >
                                  삭제
                                </Button>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md text-[14px] text-[#2D3748] whitespace-pre-wrap font-mono leading-relaxed">
                              {prompt.instruction}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Members Tab */}
                  <TabsContent value="members" className="p-8 m-0">
                    <div className="max-w-4xl">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-[20px] font-semibold text-[#1b2559] mb-2">팀 멤버</h3>
                          <p className="text-[14px] text-[#718096]">{selectedTeamData.memberCount}명의 멤버가 있습니다</p>
                        </div>
                        <Button className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white">
                          <UserPlus className="w-4 h-4 mr-2" />
                          멤버 초대
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { name: 'Adela Parkson', email: 'adela@company.com', role: '관리자', joinDate: '2024-01-15' },
                          { name: 'John Smith', email: 'john@company.com', role: '멤버', joinDate: '2024-02-20' },
                          { name: 'Sarah Kim', email: 'sarah@company.com', role: '멤버', joinDate: '2024-03-10' },
                          { name: 'David Lee', email: 'david@company.com', role: '멤버', joinDate: '2024-10-28' },
                          { name: 'Emily Chen', email: 'emily@company.com', role: '멤버', joinDate: '2024-11-01' },
                        ].map((member, idx) => (
                          <Card key={idx} className="p-4 border-[#E9EDF7] hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center text-white font-semibold">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-[14px] font-semibold text-[#1b2559]">{member.name}</p>
                                  <p className="text-[12px] text-[#718096] flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </p>
                                  <p className="text-[11px] text-[#718096] mt-0.5">가입일: {member.joinDate}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-[#0EA5E9] text-[#0EA5E9]">
                                  {member.role}
                                </Badge>
                                <Button variant="ghost" size="sm" className="text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute top-6 left-6 text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]"
              >
                {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>
              <Users className="w-16 h-16 text-[#E9EDF7] mx-auto mb-4" />
              <p className="text-[16px] text-[#718096]">팀을 선택하여 상세 정보를 확인하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[24px] text-[#1b2559]">폴더 만들기</DialogTitle>
            <DialogDescription className="text-[14px] text-[#718096]">
              새로운 폴더를 만들어 파일을 정리하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-[14px] text-[#1b2559]">
                폴더 이름 *
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="폴더 이름을 입력하세요"
                className="border-[#E9EDF7]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsCreateFolderDialogOpen(false);
                setNewFolderName('');
              }}
              className="border-[#E9EDF7] text-[#718096]"
            >
              취소
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
            >
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[24px] text-[#1b2559]">팀 만들기</DialogTitle>
            <DialogDescription className="text-[14px] text-[#718096]">
              새로운 팀을 만들어 협업을 시작하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-[14px] text-[#1b2559]">
                팀 이름 *
              </Label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                className="border-[#E9EDF7]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTeam();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description" className="text-[14px] text-[#1b2559]">
                설명
              </Label>
              <Input
                id="team-description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="팀에 대한 간단한 설명을 입력하세요 (선택)"
                className="border-[#E9EDF7]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewTeamName('');
                setNewTeamDescription('');
              }}
              className="border-[#E9EDF7] text-[#718096]"
            >
              취소
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim()}
              className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
            >
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Instruction Edit Dialog */}
      <GroupInstructionEditDialog
        open={isInstructionDialogOpen}
        onOpenChange={setIsInstructionDialogOpen}
        initialTitle={editingInstruction?.title || ''}
        initialContent={editingInstruction?.instruction || ''}
        onSave={handleSaveInstruction}
      />
    </div>
  );
}