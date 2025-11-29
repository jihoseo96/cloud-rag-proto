// frontEnd/src/pages/TeamManagementPage.tsx

/**
 * TeamManagementPage
 *
 * 팀 관리 페이지 래퍼
 * - 기존 TeamManagement 컴포넌트를 페이지로 래핑
 * - React Router와 통합
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeamManagement from '../components/TeamManagement';
import { useApp } from '../contexts/AppContext';
import { approveAnswerCard, listAnswers } from '../lib/api';

export default function TeamManagementPage() {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const {
    teams,
    handleCreateTeam,
    handleDeleteTeam,
    standardAnswers,
    setStandardAnswers,
  } = useApp();

  const handleBack = () => {
    navigate('/');
  };

  const handleUpdateStandardAnswer = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    // 1) 프론트 상태 먼저 업데이트
    setStandardAnswers((prev) =>
      prev.map((sa) =>
        sa.id === id
          ? {
            ...sa,
            status,
            approvedBy: status === 'approved' ? 'Adela Parkson' : undefined,
            approvedAt: status === 'approved' ? new Date() : undefined,
          }
          : sa
      )
    );

    // 2) 승인인 경우에만 백엔드 /answers/{id}/approve 호출
    if (status === 'approved') {
      try {
        await approveAnswerCard(id, { reviewedBy: 'Adela Parkson' });
      } catch (e) {
        console.error('Failed to approve answer card', e);
        // TODO: 에러 토스트 & 상태 롤백 고려
      }
    }
    // rejected 는 아직 별도 API 없으니 프론트 상태만 관리
  };

  // (선행 작업) 특정 팀의 AnswerCard를 백엔드에서 불러오는 훅
  // 실제 매핑은 다음 스텝에서 구현해도 됨
  useEffect(() => {
    const load = async () => {
      if (!teamId) return;
      try {
        const backendAnswers = await listAnswers({ groupId: teamId });
        console.log('backendAnswers (TODO 매핑):', backendAnswers);
        // TODO:
        //  - backendAnswers -> StandardAnswer[] 로 변환
        //  - setStandardAnswers(...) 로 초기값 세팅
      } catch (e) {
        console.error('Failed to load answers', e);
      }
    };
    load();
  }, [teamId, setStandardAnswers]);

  // URL 기준 초기 상태 결정
  const isCreateDialog = teamId === 'create';
  const selectedTeam = isCreateDialog ? null : teamId || null;

  return (
    <TeamManagement
      onBack={handleBack}
      teams={teams}
      onCreateTeam={handleCreateTeam}
      onDeleteTeam={handleDeleteTeam}
      initialSelectedTeam={selectedTeam}
      initialSidebarCollapsed={selectedTeam !== null}
      initialShowCreateDialog={isCreateDialog}
      standardAnswers={standardAnswers}
      onUpdateStandardAnswer={handleUpdateStandardAnswer}
    />
  );
}
