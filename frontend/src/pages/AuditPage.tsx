/**
 * AuditPage.tsx
 * Comprehensive audit log for compliance and traceability
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { 
  Clock,
  Search,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Upload,
  GitMerge,
  Shield
} from 'lucide-react';
import { AuditLog } from '../types';

function AuditPage() {
  const { projectId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockAuditLogs: AuditLog[] = [
    {
      id: 'log-1',
      entityType: 'variant',
      entityId: 'var-1',
      action: 'approve',
      userId: 'user-1',
      userEmail: 'john.doe@company.com',
      timestamp: new Date('2024-11-28T14:30:00'),
      metadata: { variantContent: 'ISO 27001 certification text', riskLevel: 'SAFE' },
    },
    {
      id: 'log-2',
      entityType: 'upload',
      entityId: 'doc-5',
      action: 'upload',
      userId: 'user-2',
      userEmail: 'jane.smith@company.com',
      timestamp: new Date('2024-11-28T12:15:00'),
      metadata: { fileName: 'Security_Policy_2024.pdf', fileSize: '2.5 MB' },
    },
    {
      id: 'log-3',
      entityType: 'conflict',
      entityId: 'conf-1',
      action: 'resolve',
      userId: 'user-1',
      userEmail: 'john.doe@company.com',
      timestamp: new Date('2024-11-28T11:45:00'),
      metadata: { resolution: 'Keep newest document', conflictType: 'contradiction' },
    },
    {
      id: 'log-4',
      entityType: 'answer-card',
      entityId: 'card-3',
      action: 'create',
      userId: 'system',
      userEmail: 'system@rfpos.ai',
      timestamp: new Date('2024-11-28T10:20:00'),
      metadata: { topic: 'Data Center Location', confidence: 0.88 },
    },
    {
      id: 'log-5',
      entityType: 'variant',
      entityId: 'var-8',
      action: 'reject',
      userId: 'user-3',
      userEmail: 'manager@company.com',
      timestamp: new Date('2024-11-27T16:00:00'),
      metadata: { reason: 'Outdated information', riskLevel: 'HIGH' },
    },
    {
      id: 'log-6',
      entityType: 'requirement',
      entityId: 'req-2',
      action: 'edit',
      userId: 'user-1',
      userEmail: 'john.doe@company.com',
      timestamp: new Date('2024-11-27T14:30:00'),
      metadata: { field: 'complianceLevel', oldValue: 'UNKNOWN', newValue: 'YES' },
    },
  ];

  const [logs] = useState<AuditLog[]>(mockAuditLogs);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approve': return '승인';
      case 'reject': return '거부';
      case 'edit': return '편집';
      case 'delete': return '삭제';
      case 'upload': return '업로드';
      case 'resolve': return '해결';
      case 'create': return '생성';
      default: return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve': return <CheckCircle2 className="h-4 w-4 text-[#10b981]" />;
      case 'reject': return <XCircle className="h-4 w-4 text-[#ef4444]" />;
      case 'edit': return <Edit className="h-4 w-4 text-[#14b8a6]" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-[#ef4444]" />;
      case 'upload': return <Upload className="h-4 w-4 text-[#14b8a6]" />;
      case 'resolve': return <GitMerge className="h-4 w-4 text-[#10b981]" />;
      case 'create': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'text-[#10b981]';
      case 'reject': return 'text-[#ef4444]';
      case 'edit': return 'text-[#14b8a6]';
      case 'delete': return 'text-[#ef4444]';
      case 'upload': return 'text-[#14b8a6]';
      case 'resolve': return 'text-[#10b981]';
      default: return 'text-foreground';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'answer-card': return <Shield className="h-3.5 w-3.5" />;
      case 'variant': return <FileText className="h-3.5 w-3.5" />;
      case 'conflict': return <GitMerge className="h-3.5 w-3.5" />;
      case 'upload': return <Upload className="h-3.5 w-3.5" />;
      case 'requirement': return <CheckCircle2 className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.userEmail.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      JSON.stringify(log.metadata).toLowerCase().includes(query)
    );
  });

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-[0.9375rem] font-semibold tracking-tight">감사 로그</h1>
            <p className="text-[0.75rem] text-muted-foreground">
              컴플라이언스 및 검증을 위한 완전한 활동 추적
            </p>
          </div>
          <div className="flex items-center gap-2 text-[0.75rem]">
            <span className="text-muted-foreground">총 이벤트:</span>
            <span className="font-semibold mono">{logs.length}건</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="감사 로그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-[0.8125rem]"
                />
              </div>

              {/* Audit Timeline */}
              <div className="space-y-2">
                {filteredLogs.map((log, idx) => {
                  const isNewDay = idx === 0 || 
                    log.timestamp.toDateString() !== filteredLogs[idx - 1].timestamp.toDateString();

                  return (
                    <div key={log.id}>
                      {isNewDay && (
                        <div className="text-[0.75rem] font-semibold text-muted-foreground mb-2 mt-4">
                          {log.timestamp.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                      
                      <div className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Timeline Dot */}
                          <div className="mt-1">{getActionIcon(log.action)}</div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[0.8125rem] font-medium ${getActionColor(log.action)}`}>
                                  {getActionLabel(log.action)}
                                </span>
                                <span className="text-[0.75rem] text-muted-foreground flex items-center gap-1.5">
                                  {getEntityIcon(log.entityType)}
                                  {log.entityType}
                                </span>
                                <span className="text-[0.6875rem] text-muted-foreground mono">
                                  ID: {log.entityId}
                                </span>
                              </div>
                              <span className="text-[0.6875rem] text-muted-foreground mono flex-shrink-0">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                            </div>

                            {/* Metadata */}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="bg-muted/50 border border-border rounded p-2 mb-2">
                                <div className="text-[0.75rem] space-y-1">
                                  {Object.entries(log.metadata).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2">
                                      <span className="text-muted-foreground min-w-24">{key}:</span>
                                      <span className="flex-1 mono break-all">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* User */}
                            <div className="flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span>{log.userEmail}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-[0.8125rem] text-muted-foreground">No audit logs found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default AuditPage;
