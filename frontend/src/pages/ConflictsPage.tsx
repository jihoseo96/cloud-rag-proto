/**
 * ConflictsPage.tsx
 * Screen 2: The "Batch Conflict Resolver" (Guided Control)
 * Full-screen resolution center with data grid layout
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  FileText,
  Calendar,
  TrendingUp,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { Conflict } from '../types';
import { toast } from 'sonner@2.0.3';

function ConflictsPage() {
  const { projectId } = useParams();
  
  // Mock data
  const [conflicts, setConflicts] = useState<Conflict[]>([
    {
      id: 'conf-1',
      projectId: projectId || '',
      type: 'contradiction',
      severity: 'high',
      entities: [
        { type: 'document', id: 'doc-1', label: 'Security Policy 2024.pdf', date: new Date('2024-11-20') },
        { type: 'document', id: 'doc-2', label: 'Security Policy 2023.pdf', date: new Date('2023-10-15') },
      ],
      suggestedResolution: 'keep-newest',
      status: 'pending',
    },
    {
      id: 'conf-2',
      projectId: projectId || '',
      type: 'duplicate',
      severity: 'medium',
      entities: [
        { type: 'answer-card', id: 'card-1', label: 'ISO 27001 Certification', confidence: 0.95 },
        { type: 'answer-card', id: 'card-2', label: 'ISO27001 Compliance Status', confidence: 0.88 },
      ],
      suggestedResolution: 'keep-highest-confidence',
      status: 'pending',
    },
    {
      id: 'conf-3',
      projectId: projectId || '',
      type: 'outdated',
      severity: 'medium',
      entities: [
        { type: 'variant', id: 'var-1', label: 'SLA 99.5% (2023)', date: new Date('2023-06-01') },
        { type: 'variant', id: 'var-2', label: 'SLA 99.9% (2024)', date: new Date('2024-01-15') },
      ],
      suggestedResolution: 'keep-newest',
      status: 'pending',
    },
    {
      id: 'conf-4',
      projectId: projectId || '',
      type: 'overlap',
      severity: 'low',
      entities: [
        { type: 'answer-card', id: 'card-3', label: 'Data Center Location - Seoul', confidence: 0.92 },
        { type: 'answer-card', id: 'card-4', label: 'Infrastructure Location Information', confidence: 0.85 },
      ],
      suggestedResolution: 'merge',
      status: 'pending',
    },
  ]);

  const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(new Set());

  const handleResolve = (conflictId: string, resolution: 'A' | 'B' | 'merge' | 'ignore') => {
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return {
          ...c,
          status: 'resolved',
          resolution: resolution === 'A' ? `Keep ${c.entities[0].label}` :
                      resolution === 'B' ? `Keep ${c.entities[1].label}` :
                      resolution === 'merge' ? 'Merge both entities' :
                      'Ignore conflict',
          resolvedBy: 'current-user',
          resolvedAt: new Date(),
        };
      }
      return c;
    }));
    
    toast.success('Conflict resolved');
  };

  const handleBatchAccept = () => {
    const toResolve = Array.from(selectedConflicts);
    setConflicts(prev => prev.map(c => {
      if (toResolve.includes(c.id)) {
        return {
          ...c,
          status: 'resolved',
          resolution: 'Accepted AI recommendation',
          resolvedBy: 'current-user',
          resolvedAt: new Date(),
        };
      }
      return c;
    }));
    
    setSelectedConflicts(new Set());
    toast.success(`Resolved ${toResolve.length} conflict(s)`);
  };

  const toggleSelection = (conflictId: string) => {
    setSelectedConflicts(prev => {
      const next = new Set(prev);
      if (next.has(conflictId)) {
        next.delete(conflictId);
      } else {
        next.add(conflictId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedConflicts.size === pendingConflicts.length) {
      setSelectedConflicts(new Set());
    } else {
      setSelectedConflicts(new Set(pendingConflicts.map(c => c.id)));
    }
  };

  const pendingConflicts = conflicts.filter(c => c.status === 'pending');
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-[#ef4444]';
      case 'medium': return 'text-[#f97316]';
      case 'low': return 'text-[#f59e0b]';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contradiction': return '모순';
      case 'duplicate': return '중복';
      case 'outdated': return '구버전';
      case 'overlap': return '중첩';
      default: return type;
    }
  };

  const getRecommendationLabel = (resolution: string) => {
    switch (resolution) {
      case 'keep-newest': return '최신 버전 유지';
      case 'keep-highest-confidence': return '높은 신뢰도 유지';
      case 'merge': return '병합';
      case 'manual': return '수동 검토 필요';
      default: return resolution;
    }
  };

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-[0.9375rem] font-semibold tracking-tight">충돌 해결 센터</h1>
            <p className="text-[0.75rem] text-muted-foreground">
              AI 권장사항 기반 가이드 충돌 해결
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-[0.75rem] mr-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ef4444]" />
                <span className="text-muted-foreground">높음:</span>
                <span className="font-semibold">
                  {pendingConflicts.filter(c => c.severity === 'high').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f97316]" />
                <span className="text-muted-foreground">보통:</span>
                <span className="font-semibold">
                  {pendingConflicts.filter(c => c.severity === 'medium').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                <span className="text-muted-foreground">낮음:</span>
                <span className="font-semibold">
                  {pendingConflicts.filter(c => c.severity === 'low').length}
                </span>
              </div>
            </div>
            {selectedConflicts.size > 0 && (
              <Button
                size="sm"
                onClick={handleBatchAccept}
                className="bg-[#14b8a6] hover:bg-[#0d9488]"
              >
                Accept {selectedConflicts.size} Recommendation(s)
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Pending Conflicts - Data Grid */}
              {pendingConflicts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[0.875rem] font-semibold">Pending Resolution</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="text-[0.75rem]"
                    >
                      {selectedConflicts.size === pendingConflicts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Grid Header */}
                    <div className="bg-muted/50 border-b border-border grid grid-cols-12 gap-4 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-muted-foreground font-semibold">
                      <div className="col-span-1">Select</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-4">Detected Entities</div>
                      <div className="col-span-2">AI Recommendation</div>
                      <div className="col-span-3">Actions</div>
                    </div>

                    {/* Grid Rows */}
                    <div className="divide-y divide-border">
                      {pendingConflicts.map((conflict) => (
                        <div
                          key={conflict.id}
                          className={`grid grid-cols-12 gap-4 px-4 py-4 items-start hover:bg-muted/30 transition-colors ${
                            selectedConflicts.has(conflict.id) ? 'bg-muted/20' : ''
                          }`}
                        >
                          {/* Select */}
                          <div className="col-span-1 flex items-center pt-1">
                            <input
                              type="checkbox"
                              checked={selectedConflicts.has(conflict.id)}
                              onChange={() => toggleSelection(conflict.id)}
                              className="h-4 w-4 rounded border-border"
                            />
                          </div>

                          {/* Type */}
                          <div className="col-span-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(conflict.severity)}`} />
                              <div>
                                <div className="text-[0.8125rem] font-medium">
                                  {getTypeLabel(conflict.type)}
                                </div>
                                <div className={`text-[0.6875rem] ${getSeverityColor(conflict.severity)}`}>
                                  {conflict.severity.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Entities */}
                          <div className="col-span-4 space-y-2">
                            {conflict.entities.map((entity, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-[0.75rem] p-2 bg-card border border-border rounded"
                              >
                                <div className="mt-0.5">
                                  {entity.type === 'document' && <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                                  {entity.type === 'answer-card' && <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />}
                                  {entity.type === 'variant' && <GitMerge className="h-3.5 w-3.5 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{entity.label}</div>
                                  <div className="flex items-center gap-3 text-[0.6875rem] text-muted-foreground mt-0.5">
                                    {entity.confidence !== undefined && (
                                      <span className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {(entity.confidence * 100).toFixed(0)}%
                                      </span>
                                    )}
                                    {entity.date && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {entity.date.toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* AI Recommendation */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2 text-[0.75rem] p-2 bg-[#14b8a6]/10 border border-[#14b8a6]/20 rounded">
                              <ChevronRight className="h-3.5 w-3.5 text-[#14b8a6]" />
                              <span className="font-medium text-[#14b8a6]">
                                {getRecommendationLabel(conflict.suggestedResolution)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(conflict.id, 'A')}
                              className="text-[0.75rem] h-8"
                            >
                              Keep A
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(conflict.id, 'B')}
                              className="text-[0.75rem] h-8"
                            >
                              Keep B
                            </Button>
                            {conflict.suggestedResolution === 'merge' && (
                              <Button
                                size="sm"
                                onClick={() => handleResolve(conflict.id, 'merge')}
                                className="text-[0.75rem] h-8 bg-[#14b8a6] hover:bg-[#0d9488]"
                              >
                                Merge
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResolve(conflict.id, 'ignore')}
                              className="text-[0.75rem] h-8"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resolved Conflicts */}
              {resolvedConflicts.length > 0 && (
                <div>
                  <h2 className="text-[0.875rem] font-semibold mb-3">Recently Resolved</h2>
                  <div className="space-y-2">
                    {resolvedConflicts.slice(0, 5).map((conflict) => (
                      <div
                        key={conflict.id}
                        className="border border-border rounded-lg p-4 bg-card/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                          <div>
                            <div className="text-[0.8125rem] font-medium">
                              {getTypeLabel(conflict.type)} • {conflict.resolution}
                            </div>
                            <div className="text-[0.6875rem] text-muted-foreground">
                              Resolved {conflict.resolvedAt?.toLocaleString()} by {conflict.resolvedBy}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[0.75rem]">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingConflicts.length === 0 && resolvedConflicts.length === 0 && (
                <div className="text-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-[#10b981] mx-auto mb-4" />
                  <h3 className="text-[0.9375rem] font-semibold mb-1">No conflicts detected</h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    All knowledge entities are consistent
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default ConflictsPage;
