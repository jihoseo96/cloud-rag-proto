/**
 * UploadPage.tsx
 * Screen 1: The "Zero Ingestion" Loading State & Dashboard
 * Detailed ingestion status with confidence-building progress indicators
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Anchor,
  GitBranch,
  Shield
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DocumentUpload, ProcessingStep } from '../types';

function UploadPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedUpload, setExpandedUpload] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newUploads: DocumentUpload[] = files.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      projectId: projectId || '',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      uploadedBy: 'current-user',
      status: 'processing',
      processingSteps: [
        { step: '보안 스토리지에 파일 업로드', status: 'completed', progress: 100 },
        { step: '문서 레이아웃 및 구조 파싱', status: 'running', progress: 45 },
        { step: '의미론적 엔티티 추출', status: 'pending', progress: 0 },
        { step: '버전 충돌 감지', status: 'pending', progress: 0 },
        { step: '의미론적 앵커 인덱싱', status: 'pending', progress: 0 },
        { step: 'AnswerCard 생성', status: 'pending', progress: 0 },
      ],
    }));

    setUploads(prev => [...newUploads, ...prev]);
    setExpandedUpload(newUploads[0]?.id || null);
    
    // Simulate processing
    newUploads.forEach((upload, uploadIdx) => {
      simulateProcessing(upload.id, uploadIdx);
    });
    
    toast.success(`Processing ${files.length} document(s)`);
  };

  const simulateProcessing = (uploadId: string, delay: number) => {
    let currentStep = 1;
    
    const processNextStep = () => {
      setUploads(prev => prev.map(u => {
        if (u.id !== uploadId) return u;
        
        const steps = [...u.processingSteps];
        
        if (currentStep < steps.length) {
          steps[currentStep - 1] = { ...steps[currentStep - 1], status: 'completed', progress: 100 };
          steps[currentStep] = { ...steps[currentStep], status: 'running', progress: 0 };
        } else if (currentStep === steps.length) {
          steps[currentStep - 1] = { ...steps[currentStep - 1], status: 'completed', progress: 100 };
          return { ...u, status: 'completed', processingSteps: steps };
        }
        
        return { ...u, processingSteps: steps };
      }));
      
      // Simulate progress within current step
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          currentStep++;
          if (currentStep <= 6) {
            setTimeout(() => processNextStep(), 500);
          }
        }
        
        setUploads(prev => prev.map(u => {
          if (u.id !== uploadId) return u;
          const steps = [...u.processingSteps];
          if (steps[currentStep]) {
            steps[currentStep] = { ...steps[currentStep], progress };
          }
          return { ...u, processingSteps: steps };
        }));
      }, 200);
    };
    
    setTimeout(() => processNextStep(), delay * 1000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-[#10b981]" />;
    if (step.status === 'running') return <Loader2 className="h-4 w-4 text-[#14b8a6] animate-spin" />;
    if (step.status === 'failed') return <AlertCircle className="h-4 w-4 text-[#ef4444]" />;
    return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
  };

  const getDetailIcon = (stepName: string) => {
    if (stepName.includes('entities')) return <Database className="h-3.5 w-3.5" />;
    if (stepName.includes('anchor')) return <Anchor className="h-3.5 w-3.5" />;
    if (stepName.includes('conflict')) return <GitBranch className="h-3.5 w-3.5" />;
    if (stepName.includes('AnswerCard')) return <Shield className="h-3.5 w-3.5" />;
    return <FileText className="h-3.5 w-3.5" />;
  };

  const overallProgress = uploads.length > 0
    ? uploads.reduce((sum, u) => {
        const completedSteps = u.processingSteps.filter(s => s.status === 'completed').length;
        return sum + (completedSteps / u.processingSteps.length) * 100;
      }, 0) / uploads.length
    : 0;

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-[0.9375rem] font-semibold tracking-tight">문서 수집</h1>
            <p className="text-[0.75rem] text-muted-foreground">설정 없이 즉시 지식 추출</p>
          </div>
          <div className="flex items-center gap-3">
            {uploads.length > 0 && (
              <div className="flex items-center gap-2 text-[0.8125rem]">
                <span className="text-muted-foreground">전체 진행률:</span>
                <span className="font-semibold mono">{overallProgress.toFixed(0)}%</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/project/${projectId}/cards`)}
            >
              지식 베이스 보기
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                border-2 border-dashed rounded-lg p-12 transition-all
                ${isDragging 
                  ? 'border-[#14b8a6] bg-[#14b8a6]/5' 
                  : 'border-border hover:border-muted-foreground/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold mb-1">
                    문서를 끌어다 놓아 수집 시작
                  </h3>
                  <p className="text-[0.8125rem] text-muted-foreground mb-3">
                    PDF, HWP, DOCX, TXT 파일 지원 (최대 100MB)
                  </p>
                  <label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.hwp,.docx,.txt"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">파일 선택</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Ingestion Status Panel */}
            {uploads.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[0.875rem] font-semibold">수집 대기열</h2>
                  <span className="text-[0.75rem] text-muted-foreground">
                    {uploads.filter(u => u.status === 'completed').length} / {uploads.length} 완료
                  </span>
                </div>

                {uploads.map((upload) => {
                  const isExpanded = expandedUpload === upload.id;
                  const currentStep = upload.processingSteps.find(s => s.status === 'running');
                  const completedSteps = upload.processingSteps.filter(s => s.status === 'completed').length;
                  const progress = (completedSteps / upload.processingSteps.length) * 100;

                  return (
                    <div
                      key={upload.id}
                      className="bg-card border border-border rounded-lg overflow-hidden"
                    >
                      {/* Summary Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setExpandedUpload(isExpanded ? null : upload.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5">
                              {upload.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                              ) : (
                                <Loader2 className="h-5 w-5 text-[#14b8a6] animate-spin" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[0.8125rem] font-semibold truncate">
                                  {upload.fileName}
                                </h3>
                                <span className="text-[0.6875rem] text-muted-foreground mono">
                                  {(upload.fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                              {currentStep && upload.status !== 'completed' && (
                                <p className="text-[0.75rem] text-muted-foreground flex items-center gap-2">
                                  {getDetailIcon(currentStep.step)}
                                  {currentStep.step}...
                                </p>
                              )}
                              {upload.status === 'completed' && (
                                <p className="text-[0.75rem] text-[#10b981]">
                                  Processing complete • Knowledge extracted
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[0.75rem] font-semibold mono">
                                {progress.toFixed(0)}%
                              </div>
                              <div className="text-[0.6875rem] text-muted-foreground">
                                Step {completedSteps + 1} of {upload.processingSteps.length}
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <Progress value={progress} className="h-1.5 mt-3" />
                      </div>

                      {/* Detailed Steps */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/20 p-4">
                          <div className="space-y-2">
                            {upload.processingSteps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="mt-0.5">{getStepIcon(step)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`text-[0.75rem] flex items-center gap-2 ${
                                      step.status === 'completed' ? 'text-foreground' :
                                      step.status === 'running' ? 'text-foreground font-medium' :
                                      'text-muted-foreground'
                                    }`}>
                                      {getDetailIcon(step.step)}
                                      {step.step}
                                    </span>
                                    {step.status === 'running' && step.progress !== undefined && (
                                      <span className="text-[0.6875rem] mono text-muted-foreground">
                                        {step.progress.toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                  {step.status === 'running' && step.progress !== undefined && (
                                    <Progress value={step.progress} className="h-1" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default UploadPage;
