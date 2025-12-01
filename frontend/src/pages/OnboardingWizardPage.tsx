/**
 * Screen 1: Project Onboarding Wizard
 * Step 1: Upload -> Step 2: Analyze -> Step 3: Conflict Resolution
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  Coins,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { ingestApi } from '../api/ingest';

interface ConflictItem {
  id: string;
  type: 'version' | 'content' | 'metadata';
  file1: {
    name: string;
    version: string;
    date: Date;
    size: string;
    preview: string;
  };
  file2: {
    name: string;
    version: string;
    date: Date;
    size: string;
    preview: string;
  };
  recommendation: 'keep_new' | 'keep_old' | 'merge';
  confidence: number;
  resolution?: 'keep_old' | 'keep_new' | 'merge';
}

function OnboardingWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Mock conflict data (initially empty, populated if API returns conflict)
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  const estimatedCost = 120; // KRW
  const estimatedTime = 8; // minutes

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await ingestApi.uploadFile(file);

        if (result.status === 'success') {
          // No conflict, go to project or confirmation
          // For now, let's simulate going to step 4 (Confirm) or directly to project
          console.log('Upload success:', result);
          navigate('/project/proj-1'); // TODO: Use real project ID
        } else if (result.status === 'conflict' && result.conflict_detail) {
          // Map API conflict to UI ConflictItem
          // Note: Backend currently gives limited info, so we mock some parts for UI demo
          const newConflict: ConflictItem = {
            id: 'conf-' + Date.now(),
            type: result.conflict_detail.type as any || 'version',
            file1: {
              name: result.filename, // Existing file (simulated)
              version: 'v1.0',
              date: new Date(),
              size: 'Unknown',
              preview: 'Existing content...'
            },
            file2: {
              name: result.filename, // New file
              version: 'New',
              date: new Date(),
              size: (file.size / 1024).toFixed(1) + ' KB',
              preview: 'New content...'
            },
            recommendation: 'keep_new', // Default recommendation
            confidence: Math.round((result.conflict_detail.similarity || 0) * 100),
            resolution: undefined
          };
          setConflicts([newConflict]);
          setCurrentStep(3); // Jump to conflict step
        }
      } catch (err) {
        console.error('Upload failed', err);
        setUploadError('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleResolutionChange = (conflictId: string, resolution: ConflictItem['resolution']) => {
    setConflicts(conflicts.map(c =>
      c.id === conflictId ? { ...c, resolution } : c
    ));
  };

  const allResolved = conflicts.every(c => c.resolution !== undefined);
  const resolvedCount = conflicts.filter(c => c.resolution !== undefined).length;

  const getTypeColor = (type: ConflictItem['type']) => {
    switch (type) {
      case 'version':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'content':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'metadata':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getRecommendationLabel = (rec: ConflictItem['recommendation']) => {
    switch (rec) {
      case 'keep_new':
        return 'Keep New Recommended';
      case 'keep_old':
        return 'Keep Old Recommended';
      case 'merge':
        return 'Merge Recommended';
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Project Onboarding</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  New Project: Government Defense RFP 2024-Q4
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 mt-4">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 flex-1 ${idx + 1 < currentStep ? 'text-teal-400' :
                      idx + 1 === currentStep ? 'text-foreground' :
                        'text-muted-foreground'
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${idx + 1 < currentStep ? 'bg-teal-500/20 border-teal-500' :
                        idx + 1 === currentStep ? 'bg-blue-500/20 border-blue-500' :
                          'bg-muted border-border'
                      }`}>
                      {idx + 1 < currentStep ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">
                      {idx === 0 && 'Upload'}
                      {idx === 1 && 'Configure'}
                      {idx === 2 && 'Resolve Conflicts'}
                      {idx === 3 && 'Confirm'}
                    </span>
                  </div>
                  {idx < totalSteps - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto px-6 py-6">

            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-full max-w-md text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <UploadCloud className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Upload RFP Documents</h2>
                  <p className="text-muted-foreground mb-8">
                    Upload PDF, HWP, or DOCX files to start analysis.
                  </p>

                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Button className="w-full h-12 text-lg" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Select Files'
                      )}
                    </Button>
                  </div>
                  {uploadError && (
                    <p className="text-red-500 mt-4 text-sm">{uploadError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Conflict Resolution */}
            {currentStep === 3 && (
              <>
                {/* Alert Banner */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-400 mb-1">
                        Ambiguity Detected
                      </h3>
                      <p className="text-sm text-foreground/90 mb-2">
                        We found {conflicts.length} conflicting files in your upload. Please resolve these conflicts before proceeding.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{resolvedCount}/{conflicts.length} Resolved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conflict List */}
                <div className="space-y-4">
                  {conflicts.map((conflict, idx) => (
                    <div
                      key={conflict.id}
                      className="bg-card border border-border rounded-lg overflow-hidden"
                    >
                      {/* Conflict Header */}
                      <div className="bg-muted/30 px-5 py-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-semibold text-muted-foreground">
                              #{idx + 1}
                            </span>
                            <Badge variant="outline" className={getTypeColor(conflict.type)}>
                              {conflict.type.toUpperCase()}
                            </Badge>
                            <div className="h-4 w-px bg-border" />
                            <div className="text-sm">
                              <span className="text-muted-foreground">AI Recommendation: </span>
                              <span className="font-medium text-foreground">{getRecommendationLabel(conflict.recommendation)}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                (Confidence: {conflict.confidence}%)
                              </span>
                            </div>
                          </div>
                          {conflict.resolution && (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                      </div>

                      {/* Conflict Content */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                          {/* File 1 */}
                          <div className="border border-border rounded-lg p-4 bg-muted/10">
                            <div className="flex items-start gap-3 mb-3">
                              <FileText className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {conflict.file1.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{conflict.file1.version}</span>
                                  <span>•</span>
                                  <span>{conflict.file1.date.toLocaleDateString('ko-KR')}</span>
                                  <span>•</span>
                                  <span>{conflict.file1.size}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground bg-background rounded p-2 border border-border">
                              {conflict.file1.preview}
                            </div>
                          </div>

                          {/* File 2 */}
                          <div className="border border-border rounded-lg p-4 bg-muted/10">
                            <div className="flex items-start gap-3 mb-3">
                              <FileText className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {conflict.file2.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{conflict.file2.version}</span>
                                  <span>•</span>
                                  <span>{conflict.file2.date.toLocaleDateString('ko-KR')}</span>
                                  <span>•</span>
                                  <span>{conflict.file2.size}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground bg-background rounded p-2 border border-border">
                              {conflict.file2.preview}
                            </div>
                          </div>
                        </div>

                        {/* Resolution Options */}
                        <div className="bg-muted/20 rounded-lg p-4 border border-border">
                          <Label className="text-sm font-semibold text-foreground mb-3 block">
                            Resolution Action (Required)
                          </Label>
                          <RadioGroup
                            value={conflict.resolution || ''}
                            onValueChange={(value) => handleResolutionChange(conflict.id, value as ConflictItem['resolution'])}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="keep_old" id={`${conflict.id}-old`} />
                                <Label htmlFor={`${conflict.id}-old`} className="text-sm cursor-pointer flex-1">
                                  <span className="font-medium text-foreground">Keep Old Version</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({conflict.file1.name})
                                  </span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="keep_new" id={`${conflict.id}-new`} />
                                <Label htmlFor={`${conflict.id}-new`} className="text-sm cursor-pointer flex-1">
                                  <span className="font-medium text-foreground">Keep New Version</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({conflict.file2.name})
                                  </span>
                                  {conflict.recommendation === 'keep_new' && (
                                    <Badge variant="outline" className="ml-2 text-xs bg-teal-500/10 text-teal-400 border-teal-500/30">
                                      Recommended
                                    </Badge>
                                  )}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="merge" id={`${conflict.id}-merge`} />
                                <Label htmlFor={`${conflict.id}-merge`} className="text-sm cursor-pointer flex-1">
                                  <span className="font-medium text-foreground">Merge Both</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Create separate AnswerCards for each)
                                  </span>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span className="font-mono font-semibold text-foreground">{estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Analysis Cost:</span>
                  <span className="font-mono font-semibold text-foreground">₩{estimatedCost}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                {currentStep === 3 && (
                  <Button
                    disabled={!allResolved}
                    onClick={() => navigate('/project/proj-1')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Start Analysis
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizardPage;
