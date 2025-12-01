/**
 * LandingPage.tsx
 * Screen 1: Landing & Onboarding (New Project Wizard)
 * Clean, centered upload interface with progress visualization
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

type AnalysisStep = {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
};

function LandingPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 1, label: '텍스트 추출 (Extraction)', status: 'pending' },
    { id: 2, label: '요구사항 파쇄 (Shredding)', status: 'pending' },
    { id: 3, label: '지식 매칭 (Matching)', status: 'pending' },
  ]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      startAnalysis(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startAnalysis(e.target.files[0]);
    }
  };

  const startAnalysis = (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate analysis steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      
      setAnalysisSteps(prev => prev.map((step, idx) => {
        if (idx < currentStep - 1) return { ...step, status: 'completed' };
        if (idx === currentStep - 1) return { ...step, status: 'running' };
        return step;
      }));

      if (currentStep > 3) {
        clearInterval(interval);
        // Navigate to Project Workspace after analysis complete
        setTimeout(() => {
          navigate('/project/new-project/workspace');
        }, 1000);
      }
    }, 2000);
  };

  const handleSampleClick = () => {
    navigate('/project/sample-project/workspace');
  };

  const getStepIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-[#0E7A4E]" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-[#0B57D0] animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-[#D0362D]" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-[#E0E0E0]" />;
    }
  };

  return (
    <EnterpriseLayout>
      <div className="h-full flex items-center justify-center bg-white">
        <div className="max-w-2xl w-full px-6">
          
          {!isAnalyzing ? (
            // Empty State - Upload
            <>
              <div className="text-center mb-8">
                <h1 className="text-[1.75rem] font-semibold text-[#1F1F1F] mb-3">
                  RFP 분석을 시작합니다
                </h1>
                <p className="text-[0.9375rem] text-[#424242]">
                  파일을 업로드하세요
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`
                  border-2 border-dashed rounded-lg p-16 transition-all
                  ${isDragging 
                    ? 'border-[#0B57D0] bg-[#0B57D0]/5' 
                    : 'border-[#E0E0E0] hover:border-[#9AA0A6]'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-[#F7F7F8] flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[#424242]" />
                  </div>
                  
                  <div>
                    <p className="text-[0.9375rem] text-[#1F1F1F] font-medium mb-2">
                      여기로 RFP 파일을 드래그 앤 드롭 하세요
                    </p>
                    <p className="text-[0.8125rem] text-[#9AA0A6]">
                      PDF / HWP / DOCX 지원
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <label>
                      <input
                        type="file"
                        accept=".pdf,.hwp,.docx"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <Button variant="default" size="default" asChild>
                        <span className="cursor-pointer">파일 선택</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sample Trigger */}
              <div className="text-center mt-6">
                <button
                  onClick={handleSampleClick}
                  className="text-[0.875rem] text-[#0B57D0] hover:underline"
                >
                  샘플 파일로 분석 결과 미리보기
                </button>
              </div>
            </>
          ) : (
            // Analyzing State - Progress Stepper
            <>
              <div className="text-center mb-8">
                <h1 className="text-[1.75rem] font-semibold text-[#1F1F1F] mb-3">
                  분석 진행중
                </h1>
                <p className="text-[0.9375rem] text-[#424242]">
                  AI가 RFP 파일을 분석하고 있습니다
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="bg-white border border-[#E0E0E0] rounded-lg p-8">
                <div className="space-y-6">
                  {analysisSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Step Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getStepIcon(step.status)}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[0.9375rem] font-medium ${
                            step.status === 'completed' ? 'text-[#0E7A4E]' :
                            step.status === 'running' ? 'text-[#0B57D0]' :
                            'text-[#9AA0A6]'
                          }`}>
                            {step.id}/3 {step.label}
                          </span>
                          {step.status === 'completed' && (
                            <span className="text-[0.75rem] text-[#0E7A4E]">완료</span>
                          )}
                          {step.status === 'running' && (
                            <span className="text-[0.75rem] text-[#0B57D0]">진행중</span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        {step.status === 'running' && (
                          <div className="h-1 bg-[#F7F7F8] rounded-full overflow-hidden">
                            <div className="h-full bg-[#0B57D0] rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Time */}
                <div className="mt-8 pt-6 border-t border-[#E0E0E0] text-center">
                  <p className="text-[0.8125rem] text-[#9AA0A6]">
                    예상 소요 시간: 약 2-3분
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default LandingPage;
