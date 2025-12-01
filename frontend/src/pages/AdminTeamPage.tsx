/**
 * AdminTeamPage.tsx
 * Team Members & Permissions Management
 * Modern UI with role-based access control
 */

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
  UserPlus,
  Mail,
  Shield,
  Crown,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2
} from 'lucide-react';

type Role = 'admin' | 'manager' | 'member' | 'viewer';
type Status = 'active' | 'pending' | 'inactive';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedAt: Date;
  lastActive?: Date;
  avatar?: string;
};

function AdminTeamPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date('2024-11-30')
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'manager',
      status: 'active',
      joinedAt: new Date('2024-03-20'),
      lastActive: new Date('2024-11-29')
    },
    {
      id: '3',
      name: 'Alice Johnson',
      email: 'alice.j@company.com',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-06-10'),
      lastActive: new Date('2024-11-28')
    },
    {
      id: '4',
      name: 'Bob Wilson',
      email: 'bob.w@company.com',
      role: 'viewer',
      status: 'active',
      joinedAt: new Date('2024-07-05'),
      lastActive: new Date('2024-11-27')
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@company.com',
      role: 'member',
      status: 'pending',
      joinedAt: new Date('2024-11-25')
    }
  ]);

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-[#EFB81A]" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-[#0B57D0]" />;
      case 'member':
        return <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-[#9AA0A6]" />;
    }
  };

  const getRoleBadge = (role: Role) => {
    const configs = {
      admin: { label: 'Admin', class: 'bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30' },
      manager: { label: 'Manager', class: 'bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30' },
      member: { label: 'Member', class: 'bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30' },
      viewer: { label: 'Viewer', class: 'bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]' }
    };
    const config = configs[role];
    return <Badge variant="outline" className={`${config.class} text-[0.6875rem]`}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: Status) => {
    const configs = {
      active: { label: 'Active', class: 'bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30' },
      pending: { label: 'Pending', class: 'bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30' },
      inactive: { label: 'Inactive', class: 'bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]' }
    };
    const config = configs[status];
    return <Badge variant="outline" className={`${config.class} text-[0.6875rem]`}>{config.label}</Badge>;
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date()
    };
    
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setInviteRole('member');
    setInviteOpen(false);
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[1.25rem] font-semibold text-[#1F1F1F]">Team Members</h2>
            <p className="text-[0.875rem] text-[#9AA0A6] mt-1">
              {members.filter(m => m.status === 'active').length} active members · {members.filter(m => m.status === 'pending').length} pending invitations
            </p>
          </div>

          {/* Invite Button */}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="manager">Manager - Approve content</SelectItem>
                      <SelectItem value="member">Member - Create & edit</SelectItem>
                      <SelectItem value="viewer">Viewer - Read only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite}>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Permissions Info */}
        <div className="grid grid-cols-4 gap-3">
          <div className="border border-[#E0E0E0] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-[#EFB81A]" />
              <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">Admin</span>
            </div>
            <p className="text-[0.75rem] text-[#9AA0A6] leading-relaxed">
              Full system access, manage members, configure settings
            </p>
          </div>
          <div className="border border-[#E0E0E0] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-[#0B57D0]" />
              <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">Manager</span>
            </div>
            <p className="text-[0.75rem] text-[#9AA0A6] leading-relaxed">
              Approve/reject content, manage projects
            </p>
          </div>
          <div className="border border-[#E0E0E0] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-[#0E7A4E]" />
              <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">Member</span>
            </div>
            <p className="text-[0.75rem] text-[#9AA0A6] leading-relaxed">
              Create and edit content, collaborate
            </p>
          </div>
          <div className="border border-[#E0E0E0] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-[#9AA0A6]" />
              <span className="text-[0.875rem] font-semibold text-[#1F1F1F]">Viewer</span>
            </div>
            <p className="text-[0.75rem] text-[#9AA0A6] leading-relaxed">
              Read-only access, view all content
            </p>
          </div>
        </div>

        {/* Members Table */}
        <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
              <tr className="text-[0.75rem] text-[#424242] uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-semibold">Member</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Joined</th>
                <th className="text-left py-3 px-4 font-semibold">Last Active</th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-[#E0E0E0] hover:bg-[#F7F7F8] transition-colors"
                >
                  {/* Member */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#0B57D0]/10 flex items-center justify-center">
                        <span className="text-[0.875rem] font-semibold text-[#0B57D0]">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-[0.875rem] font-medium text-[#1F1F1F]">
                          {member.name}
                        </div>
                        <div className="text-[0.75rem] text-[#9AA0A6]">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member.id, v as Role)}
                      >
                        <SelectTrigger className="w-32 h-8 text-[0.8125rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {getStatusBadge(member.status)}
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4">
                    <span className="text-[0.8125rem] text-[#424242]">
                      {member.joinedAt.toLocaleDateString('ko-KR')}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-4">
                    {member.lastActive ? (
                      <span className="text-[0.8125rem] text-[#424242]">
                        {member.lastActive.toLocaleDateString('ko-KR')}
                      </span>
                    ) : (
                      <span className="text-[0.8125rem] text-[#9AA0A6]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-[#D0362D]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminTeamPage;
