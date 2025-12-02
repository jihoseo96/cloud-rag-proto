import { useState, useEffect } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search,
  UserPlus,
  Shield,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { adminApi, TeamMember } from '../api/admin';

function AdminTeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.listMembers();
      setMembers(data);
    } catch (e) {
      console.error("Failed to load members", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      setIsInviting(true);
      await adminApi.inviteMember(inviteEmail, 'member');
      setInviteEmail('');
      await loadMembers();
      alert("초대장이 발송되었습니다.");
    } catch (e) {
      console.error("Failed to invite", e);
      alert("초대 실패");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleUpdate = async (id: string, newRole: string) => {
    try {
      await adminApi.updateMemberRole(id, newRole);
      await loadMembers();
    } catch (e) {
      console.error("Failed to update role", e);
      alert("권한 수정 실패");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminApi.removeMember(id);
      await loadMembers();
    } catch (e) {
      console.error("Failed to remove member", e);
      alert("삭제 실패");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">Manager</Badge>;
      default:
        return <Badge variant="outline" className="text-[#424242]">Member</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center text-[0.75rem] text-[#0E7A4E]">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-[0.75rem] text-[#EFB81A]">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </div>
        );
      default:
        return <span className="text-[0.75rem] text-[#9AA0A6]">{status}</span>;
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <EnterpriseLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
          <div>
            <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Team Members</h1>
            <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">
              워크스페이스 멤버 및 권한 관리
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-[#F7F7F8] px-3 py-1.5 rounded-md border border-[#E0E0E0]">
              <Mail className="h-4 w-4 text-[#9AA0A6]" />
              <Input
                placeholder="이메일 주소 입력"
                className="h-7 w-48 border-none bg-transparent focus-visible:ring-0 px-0 text-[0.8125rem]"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={handleInvite} disabled={isInviting}>
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1.5" />}
              초대하기
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="h-14 border-b border-[#E0E0E0] flex items-center px-6 bg-[#F7F7F8]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
            <Input
              placeholder="이름, 이메일로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
              <table className="w-full text-left text-[0.875rem]">
                <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3 font-medium text-[#424242]">이름 / 이메일</th>
                    <th className="px-6 py-3 font-medium text-[#424242]">권한</th>
                    <th className="px-6 py-3 font-medium text-[#424242]">상태</th>
                    <th className="px-6 py-3 font-medium text-[#424242]">가입일</th>
                    <th className="px-6 py-3 font-medium text-[#424242] text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#0B57D0] mx-auto" />
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        멤버가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#F7F7F8] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0B57D0]/10 flex items-center justify-center text-[#0B57D0] font-semibold text-xs">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-[#1F1F1F]">{member.name}</div>
                              <div className="text-[0.75rem] text-[#9AA0A6]">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 text-[#424242] font-mono text-[0.8125rem]">
                          {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRoleUpdate(member.id, member.role === 'admin' ? 'member' : 'admin')}
                              className="p-1.5 text-[#9AA0A6] hover:text-[#0B57D0] hover:bg-[#0B57D0]/10 rounded transition-colors"
                              title="Change Role"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="p-1.5 text-[#9AA0A6] hover:text-[#D0362D] hover:bg-[#D0362D]/10 rounded transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default AdminTeamPage;