/**
 * UserProfile Component
 * 
 * 기능: 사용자 프로필 표시 및 프로필 액션
 * 위치: 좌측 사이드바 최하단
 * 
 * 주요 기능:
 * - 사용자 아바타 이미지 표시
 * - 사용자 이름 표시
 * - 프로필 설정 버튼 (향후 확장)
 * 
 * 데이터 출처: 현재 로그인된 사용자 정보
 */

import { User } from 'lucide-react';

interface UserProfileProps {
  /** 사용자 이름 */
  userName: string;
  /** 사용자 아바타 이미지 URL */
  userAvatar: string;
  /** 프로필 버튼 클릭 시 호출되는 콜백 */
  onProfileClick?: () => void;
}

export function UserProfile({ 
  userName, 
  userAvatar, 
  onProfileClick 
}: UserProfileProps) {
  return (
    <div className="p-4 border-t border-[#E9EDF7]">
      {/* 사용자 프로필 카드 */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]">
        {/* 사용자 아바타 */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6]">
          <img 
            src={userAvatar} 
            alt={`${userName}의 프로필`} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* 사용자 이름 */}
        <div className="flex-1">
          <p className="text-[14px] font-bold text-[#1b2559]">
            {userName}
          </p>
        </div>

        {/* 프로필 설정 버튼 */}
        <button 
          className="w-9 h-9 rounded-full border border-[#E0E5F2] flex items-center justify-center hover:bg-[#f0f9ff] transition-colors"
          onClick={onProfileClick}
          aria-label="프로필 설정"
        >
          <User className="w-4 h-4 text-[#1B2559]" />
        </button>
      </div>
    </div>
  );
}
