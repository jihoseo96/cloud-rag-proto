import { useState, useEffect } from 'react';
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
  const [fileItems, setFileItems] = useState<FileItem[]>([
    // Root level files
    { id: '1', name: '마케팅 전략.pdf', type: 'file', size: '2.4 MB', uploader: 'Sarah Kim', date: '2024-11-04', parentId: null },
    { id: '2', name: '분석 리포트.xlsx', type: 'file', size: '1.8 MB', uploader: 'John Smith', date: '2024-11-03', parentId: null },
    { id: '3', name: '프로젝트 자료', type: 'folder', parentId: null },
    { id: '4', name: '회의록', type: 'folder', parentId: null },
    
    // Files in '프로젝트 자료' folder (id: 3)
    { id: '5', name: '디자인 가이드.fig', type: 'file', size: '5.2 MB', uploader: 'Adela Parkson', date: '2024-11-02', parentId: '3' },
    { id: '6', name: '프로젝트 계획서.pptx', type: 'file', size: '3.7 MB', uploader: 'Sarah Kim', date: '2024-10-31', parentId: '3' },
    { id: '7', name: '2024 Q1', type: 'folder', parentId: '3' },
    
    // Files in '회의록' folder (id: 4)
    { id: '8', name: '회의록.docx', type: 'file', size: '156 KB', uploader: 'David Lee', date: '2024-11-01', parentId: '4' },
    { id: '9', name: '10월 회의록.docx', type: 'file', size: '203 KB', uploader: 'John Smith', date: '2024-10-28', parentId: '4' },
    
    // Files in '2024 Q1' folder (id: 7)
    { id: '10', name: 'Q1 보고서.pdf', type: 'file', size: '4.1 MB', uploader: 'Sarah Kim', date: '2024-03-31', parentId: '7' },
  ]);

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
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTeam === team.id
                    ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]'
                    : 'hover:bg-[#f0f9ff] border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Users className={`w-5 h-5 mt-1 ${selectedTeam === team.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
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
                    {selectedTeamData && standardAnswers.filter(sa => sa.teamId === selectedTeamData.id && sa.status === 'pending').length > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                        {standardAnswers.filter(sa => sa.teamId === selectedTeamData.id && sa.status === 'pending').length}
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
                        <Button className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white">
                          <Upload className="w-4 h-4 mr-2" />
                          파일 업로드
                        </Button>
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
                      {standardAnswers
                        .filter(sa => sa.teamId === selectedTeamData.id)
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
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-[20px] font-semibold text-[#1b2559] mb-2">프롬프트 라이브러리</h3>
                        <p className="text-[14px] text-[#718096]">팀에서 자주 사용하는 프롬프트를 저장하고 공유하세요</p>
                      </div>
                      <Button className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        프롬프트 추가
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          title: '마케팅 카피 생성', 
                          description: '제품이나 서비스를 홍보하는 마케팅 카피를 생성합니다',
                          uses: 47,
                          category: '마케팅'
                        },
                        { 
                          title: '코드 리뷰', 
                          description: '작성된 코드를 검토하고 개선점을 제안합니다',
                          uses: 32,
                          category: '개발'
                        },
                        { 
                          title: '회의록 요약', 
                          description: '긴 회의 내용을 핵심 포인트로 요약합니다',
                          uses: 28,
                          category: '생산성'
                        },
                        { 
                          title: '이메일 작성', 
                          description: '전문적인 비즈니스 이메일을 작성합니다',
                          uses: 56,
                          category: '커뮤니케이션'
                        },
                        { 
                          title: '아이디어 브레인스토밍', 
                          description: '창의적인 아이디어를 생성하고 발전시킵니다',
                          uses: 41,
                          category: '기획'
                        },
                        { 
                          title: 'SEO 콘텐츠', 
                          description: '검색 엔진 최적화된 콘텐츠를 작성합니다',
                          uses: 23,
                          category: '마케팅'
                        },
                      ].map((prompt, idx) => (
                        <Card key={idx} className="p-5 border-[#E9EDF7] hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-[15px] font-semibold text-[#1b2559] mb-1">{prompt.title}</h4>
                              <p className="text-[13px] text-[#718096]">{prompt.description}</p>
                            </div>
                            <Badge variant="outline" className="border-[#0EA5E9] text-[#0EA5E9] ml-2">
                              {prompt.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[12px] text-[#718096]">
                            <span>{prompt.uses}회 사용</span>
                            <Button variant="ghost" size="sm" className="h-7 text-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]">
                              사용하기
                            </Button>
                          </div>
                        </Card>
                      ))}
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
              variant="outline"
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
    </div>
  );
}