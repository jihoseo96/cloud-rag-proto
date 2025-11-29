/**
 * WorkspacePage
 * 
 * 메인 채팅 워크스페이스 페이지
 * - 좌측: 사이드바 (팀, 채팅 목록)
 * - 우측: 채팅 화면 (헤더, 메시지, 입력창)
 */

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { StandardAnswerDialog } from '../components/StandardAnswerDialog';
import { useApp } from '../contexts/AppContext';
import { Message } from '../types';
import { createAnswerCard } from '../lib/api';

export default function WorkspacePage() {
  const {
    teams,
    chats,
    chatMessages,
    selectedChat,
    selectedTeam,
    standardAnswers,
    setStandardAnswers,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAnswerForStandard, setSelectedAnswerForStandard] =
    useState<Message | null>(null);
  const [standardAnswerDialogOpen, setStandardAnswerDialogOpen] =
    useState(false);

  const selectedTeamData = selectedTeam
    ? teams.find((team) => team.id === selectedTeam) || null
    : null;

  const messages = selectedChat ? chatMessages[selectedChat] || [] : [];

  // (원본과 동일) 전체 pending 개수
  const pendingAnswersCount = standardAnswers.filter(
    (sa) => sa.status === 'pending'
  ).length;

  const handleRequestStandardAnswer = (message: Message) => {
    if (!selectedTeam) return; // 팀이 없으면 등록 안 함
    setSelectedAnswerForStandard(message);
    setStandardAnswerDialogOpen(true);
  };

  const onStandardAnswerRequest = async () => {
    if (!selectedAnswerForStandard || !selectedChat || !selectedTeam) return;

    // 선택된 메시지 앞의 메시지를 질문으로 사용
    const index = messages.findIndex(
      (m) => m.id === selectedAnswerForStandard.id
    );
    const question =
      index > 0 ? messages[index - 1]?.content || '' : '';

    // 1) 백엔드 AnswerCard 생성 호출
    try {
      await createAnswerCard({
        groupId: selectedTeam,            // teamId == group_id
        question,
        answer: selectedAnswerForStandard.content,
        // 아직 citations는 안 쓰고, 나중에 Message에 붙이면 여기에 매핑
        citations: [],
        createdBy: 'Adela Parkson',      // MVP용 하드코딩
      });
    } catch (e) {
      console.error('Failed to create answer card', e);
      // TODO: 필요하면 토스트로 사용자에게 안내
    }

    // 2) 프론트 로컬 상태에도 추가 (UI 표시용)
    const newStandardAnswer = {
      id: `sa-${Date.now()}`,
      teamId: selectedTeam,
      question,
      answer: selectedAnswerForStandard.content,
      requestedBy: 'Adela Parkson',
      requestedAt: new Date(),
      status: 'pending' as const,
      chatId: selectedChat,
      messageId: selectedAnswerForStandard.id,
    };

    setStandardAnswers((prev) => [...prev, newStandardAnswer]);
    setStandardAnswerDialogOpen(false);
    setSelectedAnswerForStandard(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar – 원래 구조 그대로 */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          pendingAnswersCount={pendingAnswersCount}
        />

        {/* Messages */}
        <MessageList
          messages={messages}
          onRequestStandardAnswer={handleRequestStandardAnswer}
        />

        {/* Input */}
        <ChatInput />
      </div>

      {/* Standard Answer Request Dialog */}
      <StandardAnswerDialog
        open={standardAnswerDialogOpen}
        onOpenChange={setStandardAnswerDialogOpen}
        selectedAnswerForStandard={selectedAnswerForStandard}
        selectedTeamData={selectedTeamData}
        onStandardAnswerRequest={onStandardAnswerRequest}
        onCancel={() => {
          setStandardAnswerDialogOpen(false);
          setSelectedAnswerForStandard(null);
        }}
      />
    </div>
  );
}
