/**
 * Screen 5: Admin Guardrails Settings
 * Security and Policy management
 */

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Shield,
  AlertTriangle,
  Save,
  X,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { adminApi } from '../api/admin';

interface ProhibitedWord {
  id: string;
  word: string;
  category: 'marketing' | 'legal' | 'technical' | 'custom';
  severity: 'error' | 'warning';
}

function AdminGuardrailsPage() {
  // Risk Policy Settings
  const [autoRejectFactMismatch, setAutoRejectFactMismatch] = useState(true);
  const [requireApprovalHighRisk, setRequireApprovalHighRisk] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [minSourceCount, setMinSourceCount] = useState([2]);

  // Prohibited Words
  const [prohibitedWords, setProhibitedWords] = useState<ProhibitedWord[]>([]);

  useEffect(() => {
    loadGuardrails();
  }, []);

  const loadGuardrails = async () => {
    try {
      const data = await adminApi.getGuardrails();
      if (data.risk_policy) {
        setAutoRejectFactMismatch(data.risk_policy.autoRejectFactMismatch);
        setRequireApprovalHighRisk(data.risk_policy.requireApprovalHighRisk);
        setConfidenceThreshold(data.risk_policy.confidenceThreshold);
        setMinSourceCount(data.risk_policy.minSourceCount);
      }
      if (data.prohibited_words) {
        setProhibitedWords(data.prohibited_words);
      }
    } catch (e) {
      console.error("Failed to load guardrails", e);
    }
  };

  const [newWord, setNewWord] = useState('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const addProhibitedWord = () => {
    if (!newWord.trim()) return;

    const newEntry: ProhibitedWord = {
      id: Date.now().toString(),
      word: newWord.trim(),
      category: 'custom',
      severity: 'warning'
    };

    setProhibitedWords(prev => [...prev, newEntry]);
    setNewWord('');
  };

  const removeProhibitedWord = (id: string) => {
    setProhibitedWords(prev => prev.filter(w => w.id !== id));
  };

  const handleSave = async () => {
    try {
      await adminApi.updateGuardrails({
        prohibited_words: prohibitedWords,
        risk_policy: {
          autoRejectFactMismatch,
          requireApprovalHighRisk,
          confidenceThreshold,
          minSourceCount
        }
      });
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (e) {
      console.error("Failed to save guardrails", e);
      alert("Failed to save settings");
    }
  };

  const getSeverityBadge = (severity: ProhibitedWord['severity']) => {
    return severity === 'error'
      ? <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">Error</Badge>
      : <Badge className="bg-[#EFB81A]/10 text-[#EFB81A] border-[#EFB81A]/30">Warning</Badge>;
  };

  const getCategoryColor = (category: ProhibitedWord['category']) => {
    switch (category) {
      case 'marketing':
        return 'bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30';
      case 'legal':
        return 'bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30';
      case 'technical':
        return 'bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30';
      case 'custom':
        return 'bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
          <div>
            <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Guardrails 설정</h1>
            <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">
              AI 생성 컨텐츠의 보안 및 품질 정책 관리
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            변경사항 저장
          </Button>
        </div>

        {/* Save Notification */}
        {showSaveNotification && (
          <div className="mx-6 mt-4 p-4 bg-[#0E7A4E]/10 border border-[#0E7A4E]/30 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#0E7A4E]" />
            <span className="text-[0.875rem] text-[#0E7A4E] font-medium">
              설정이 성공적으로 저장되었습니다
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Risk Policy Section */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">위험 정책</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  자동 위험 탐지 및 처리 설정
                </p>
              </div>

              <div className="p-5 space-y-6">

                {/* Auto-reject Fact Mismatch */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium text-foreground">
                        Auto-reject variants with Fact Mismatch
                      </Label>
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                        CRITICAL
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically reject any AnswerCard variant that contains factual information conflicting with verified facts. This prevents incorrect information from being used in proposals.
                    </p>
                  </div>
                  <Switch
                    checked={autoRejectFactMismatch}
                    onCheckedChange={setAutoRejectFactMismatch}
                  />
                </div>

                <div className="h-px bg-border" />

                {/* Require Approval for High Risk */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Require approval for High Risk content
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Any content flagged as high risk must be manually approved by a project manager before use in proposals.
                    </p>
                  </div>
                  <Switch
                    checked={requireApprovalHighRisk}
                    onCheckedChange={setRequireApprovalHighRisk}
                  />
                </div>

                <div className="h-px bg-border" />

                {/* Confidence Threshold */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Flag anchors below confidence threshold
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        AnswerCards with source confidence below this threshold will be flagged for review
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-mono font-semibold text-foreground">
                        {confidenceThreshold[0]}%
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    min={50}
                    max={95}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>50% (Low)</span>
                    <span>70% (Recommended)</span>
                    <span>95% (Strict)</span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Minimum Source Count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Minimum source document count
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Require at least this many source documents to anchor an AnswerCard
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-mono font-semibold text-foreground">
                        {minSourceCount[0]}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={minSourceCount}
                    onValueChange={setMinSourceCount}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 source</span>
                    <span>3 sources</span>
                    <span>5 sources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prohibited Words Section */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground">Prohibited Words</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Words and phrases that trigger warnings or errors in content
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {prohibitedWords.length} rules
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Add New Word */}
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Add Prohibited Word/Phrase
                  </Label>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <Input
                        placeholder="e.g., guaranteed, best-in-class"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addProhibitedWord()}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        onClick={addProhibitedWord}
                        className="w-full h-9"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Words List */}
                <div className="border border-border rounded-lg divide-y divide-border">
                  {prohibitedWords.length === 0 ? (
                    <div className="p-8 text-center">
                      <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No prohibited words configured</p>
                    </div>
                  ) : (
                    prohibitedWords.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getSeverityBadge(item.severity)}
                          <span className="font-mono text-sm text-foreground">
                            {item.word}
                          </span>
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProhibitedWord(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-foreground/90">
                      <p className="font-medium text-blue-400 mb-1">How it works</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li><strong>Error</strong>: Content containing these words will be automatically flagged and blocked from use</li>
                        <li><strong>Warning</strong>: Content will be flagged for review but not blocked</li>
                        <li>Detection is case-insensitive and checks for whole word matches</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Templates */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Compliance Templates</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Pre-configured rule sets for common compliance requirements
                </p>
              </div>

              <div className="p-5 space-y-3">
                <div className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="font-medium text-sm text-foreground mb-1">Government RFP Standard</div>
                      <p className="text-xs text-muted-foreground">
                        Strict rules for government proposals (ACTIVE)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    ACTIVE
                  </Badge>
                </div>

                <div className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm text-foreground mb-1">Financial Services</div>
                      <p className="text-xs text-muted-foreground">
                        Compliance rules for banking and finance sectors
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>

                <div className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm text-foreground mb-1">Healthcare HIPAA</div>
                      <p className="text-xs text-muted-foreground">
                        HIPAA compliance rules for healthcare proposals
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGuardrailsPage;