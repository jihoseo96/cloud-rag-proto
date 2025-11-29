/**
 * Sidebar Component
 * 
 * 좌측 사이드바 전체를 관리하는 컴포넌트
 * - Workspace 선택
 * - 팀 목록
 * - 채팅 목록
 * - 사용자 프로필
 */

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, MessageSquare, Users, MoreHorizontal, Settings, LogOut } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { WorkspaceSelector } from './WorkspaceSelector';
import { UserProfile } from './UserProfile';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Sidebar({ isSidebarOpen, onToggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const {
    workspaces,
    teams,
    chats,
    selectedChat,
    selectedTeam,
    createNewChat,
    handleCreateTeamChat,
    handleDeleteTeam,
    handleChatClick,
    userAvatar,
  } = useApp();

  const [isTeamsOpen, setIsTeamsOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleTeamClick = (teamId: string) => {
    toggleTeamExpand(teamId);
    const teamChats = chats.filter(chat => chat.teamId === teamId);
    if (teamChats.length > 0) {
      handleChatClick(teamChats[0].id, teamId);
    }
  };

  const handleTeamManagementClick = (teamId: string) => {
    navigate(`/team/${teamId}/management`);
  };

  return (
    <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 border-r border-[#E9EDF7] bg-white overflow-hidden`}>
      <div className="flex flex-col h-full">
        {/* Workspace Selector */}
        <WorkspaceSelector
          currentWorkspace={workspaces.find(w => w.type === 'personal') || workspaces[0]}
          workspaces={workspaces}
          onWorkspaceChange={(id) => console.log('Workspace changed:', id)}
          showToggle={true}
          onToggleSidebar={onToggleSidebar}
        />

        <ScrollArea className="flex-1">
          {/* Teams Section */}
          <Collapsible open={isTeamsOpen} onOpenChange={setIsTeamsOpen} className="px-4 pt-6">
            <div className="flex items-center justify-between mb-3">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                {isTeamsOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#718096]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#718096]" />
                )}
                <h2 className="text-[12px] font-semibold text-[#718096] uppercase">팀</h2>
              </CollapsibleTrigger>
              <Button 
                size="sm"
                className="h-7 px-3 bg-transparent hover:bg-[#f0f9ff] text-[#0EA5E9] shadow-none text-[11px]"
                onClick={() => navigate('/team/create')}
              >
                <Plus className="w-3 h-3 mr-1" />
                팀 생성
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-2 mb-6">
                {teams.map((team) => {
                  const teamChats = chats
                    .filter(chat => chat.teamId === team.id)
                    .sort((a, b) => b.lastUpdated - a.lastUpdated);
                  const isExpanded = expandedTeams.includes(team.id);
                  
                  return (
                    <div key={team.id}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTeamClick(team.id)}
                          className={`flex-1 text-left px-2 py-1.5 rounded-xl transition-all ${
                            selectedTeam === team.id 
                              ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                              : 'hover:bg-[#f0f9ff]'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <div className="flex items-center gap-1">
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-[#718096]" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-[#718096]" />
                              )}
                              <Users className={`w-3.5 h-3.5 ${selectedTeam === team.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[11px] font-semibold mb-0 truncate text-[#1b2559]">
                                {team.name}
                              </h3>
                              <p className="text-[9px] text-[#718096] leading-tight">{team.memberCount}명의 멤버</p>
                            </div>
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="h-8 w-8 rounded-md text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff] flex-shrink-0 inline-flex items-center justify-center transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTeamManagementClick(team.id);
                              }}
                              className="cursor-pointer"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              팀 관리
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateTeamChat(team.id);
                              }}
                              className="cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              새로운 채팅
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team.id);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              팀 나가기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Team Chats */}
                      {isExpanded && teamChats.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {teamChats.map((chat) => (
                            <button
                              key={chat.id}
                              onClick={() => handleChatClick(chat.id, chat.teamId)}
                              className={`w-full text-left px-2 py-1.5 rounded-xl transition-all ${
                                selectedChat === chat.id 
                                  ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                                  : 'hover:bg-[#f0f9ff]'
                              }`}
                            >
                              <div className="flex items-start gap-1.5">
                                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 ${selectedChat === chat.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-[11px] font-semibold mb-0 truncate text-[#1b2559]">
                                    {chat.title}
                                  </h3>
                                  <p className="text-[9px] text-[#718096] leading-tight truncate">{chat.preview}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Chats Section */}
          <Collapsible open={isChatsOpen} onOpenChange={setIsChatsOpen} className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                {isChatsOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#718096]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#718096]" />
                )}
                <h2 className="text-[12px] font-semibold text-[#718096] uppercase">채팅</h2>
              </CollapsibleTrigger>
              <Button 
                size="sm"
                className="h-7 px-3 bg-transparent hover:bg-[#f0f9ff] text-[#0EA5E9] shadow-none text-[11px]"
                onClick={createNewChat}
              >
                <Plus className="w-3 h-3 mr-1" />
                새 대화 시작
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-1">
                {chats
                  .filter(chat => chat.teamId === null)
                  .sort((a, b) => b.lastUpdated - a.lastUpdated)
                  .map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id, chat.teamId)}
                      className={`w-full text-left px-2 py-1.5 rounded-xl transition-all ${
                        selectedChat === chat.id 
                          ? 'bg-gradient-to-r from-[#E0F2FE] to-[#FAE8FF] border-l-4 border-[#0EA5E9]' 
                          : 'hover:bg-[#f0f9ff]'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <MessageSquare className={`w-3.5 h-3.5 mt-0.5 ${selectedChat === chat.id ? 'text-[#0EA5E9]' : 'text-[#718096]'}`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[11px] font-semibold mb-0 truncate text-[#1b2559]">
                            {chat.title}
                          </h3>
                          <p className="text-[9px] text-[#718096] leading-tight truncate">{chat.preview}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t border-[#E9EDF7]">
          <UserProfile 
            userName="Adela Parkson"
            userAvatar={userAvatar}
            onProfileClick={() => console.log('Profile clicked')}
          />
        </div>
      </div>
    </div>
  );
}
