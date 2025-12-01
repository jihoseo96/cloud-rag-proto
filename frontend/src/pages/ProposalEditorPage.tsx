/**
 * Screen 3: Write Proposal Editor
 * Triple-Split View: Requirements | Editor | AI Intelligence
 * High-density professional workspace
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  X,
  Save,
  FileText,
  CheckCircle2,
  Circle,
  Sparkles,
  Link2,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Copy,
  MoreHorizontal
} from 'lucide-react';

interface Requirement {
  id: string;
  section: string;
  text: string;
  mandatory: boolean;
  checked: boolean;
  page?: number;
}

interface AnswerCard {
  id: string;
  title: string;
  content: string;
  confidence: number;
  sources: Array<{ doc: string; page: number }>;
  riskLevel: 'safe' | 'medium' | 'high';
  tags: string[];
}

function ProposalEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Requirements (Left Panel)
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: 'req-1',
      section: '3.1',
      text: 'Must mention ISO 27001 certification',
      mandatory: true,
      checked: false,
      page: 5
    },
    {
      id: 'req-2',
      section: '3.2',
      text: 'Detail encryption standards (AES-256)',
      mandatory: true,
      checked: true,
      page: 7
    },
    {
      id: 'req-3',
      section: '3.3',
      text: 'Describe access control mechanisms',
      mandatory: true,
      checked: false,
      page: 8
    },
    {
      id: 'req-4',
      section: '3.4',
      text: 'Provide security audit history',
      mandatory: false,
      checked: false,
      page: 9
    },
    {
      id: 'req-5',
      section: '4.1',
      text: 'System architecture diagram',
      mandatory: true,
      checked: false,
      page: 12
    }
  ]);

  // Editor Content (Center Panel)
  const [editorContent] = useState(`## 3. Security Requirements

### 3.1 Information Security Management

Our organization maintains ISO 27001:2013 certification, demonstrating our commitment to information security best practices. [📄 Source: ISO27001_Certificate.pdf, p.5]

### 3.2 Encryption Standards

All data transmission and storage utilize AES-256 encryption, ensuring the highest level of data protection. Our encryption implementation has been validated through independent security audits. [📄 Source: Security_Audit_2024.pdf, p.7]

### 3.3 Access Control

[Click to add content - AI recommendations available →]
`);

  // AI Recommendations (Right Panel)
  const [recommendations] = useState<AnswerCard[]>([
    {
      id: 'ans-1',
      title: 'ISO 27001 Certification Details',
      content: 'Our organization achieved ISO 27001:2013 certification in June 2023, with successful surveillance audits conducted annually...',
      confidence: 98,
      sources: [
        { doc: 'ISO27001_Certificate.pdf', page: 5 },
        { doc: 'Audit_Report_2024.pdf', page: 3 }
      ],
      riskLevel: 'safe',
      tags: ['Verified', 'Certified']
    },
    {
      id: 'ans-2',
      title: 'Access Control Mechanisms',
      content: 'We implement multi-layered access control including: Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA)...',
      confidence: 92,
      sources: [
        { doc: 'Security_Policy.pdf', page: 15 }
      ],
      riskLevel: 'safe',
      tags: ['Technical', 'Security']
    },
    {
      id: 'ans-3',
      title: 'Security Audit History',
      content: 'Annual security audits conducted since 2020. Latest audit (2024) found zero critical vulnerabilities...',
      confidence: 85,
      sources: [
        { doc: 'Audit_History.xlsx', page: 1 }
      ],
      riskLevel: 'medium',
      tags: ['Historical Data']
    }
  ]);

  const toggleRequirement = (id: string) => {
    setRequirements(requirements.map(r => 
      r.id === id ? { ...r, checked: !r.checked } : r
    ));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (confidence >= 85) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (confidence >= 70) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getRiskBadge = (risk: AnswerCard['riskLevel']) => {
    switch (risk) {
      case 'safe':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">SAFE</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">REVIEW</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">HIGH RISK</Badge>;
    }
  };

  const checkedCount = requirements.filter(r => r.checked).length;
  const mandatoryCount = requirements.filter(r => r.mandatory).length;
  const mandatoryCheckedCount = requirements.filter(r => r.mandatory && r.checked).length;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">Proposal Editor</h1>
            <p className="text-xs text-muted-foreground">Government Defense RFP 2024-Q4</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{mandatoryCheckedCount}/{mandatoryCount}</span> mandatory requirements covered
          </div>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
            Export
          </Button>
        </div>
      </div>

      {/* Triple-Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Requirements Checklist (20%) */}
        <div className="w-[280px] border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-foreground">Requirements</h2>
              <Badge variant="outline" className="text-xs">
                {checkedCount}/{requirements.length}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {mandatoryCheckedCount}/{mandatoryCount} mandatory
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {requirements.map((req) => (
                <button
                  key={req.id}
                  onClick={() => toggleRequirement(req.id)}
                  className="w-full flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {req.checked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        {req.section}
                      </span>
                      {req.mandatory && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-red-500/10 text-red-400 border-red-500/30">
                          REQ
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs ${req.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {req.text}
                    </p>
                    {req.page && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        RFP p.{req.page}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center Panel: Editor (50%) */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Section 3: Security Requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-8 max-w-4xl mx-auto">
              {/* Simplified Editor Display */}
              <div className="prose prose-invert max-w-none">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">3. Security Requirements</h2>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3">3.1 Information Security Management</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                      Our organization maintains ISO 27001:2013 certification, demonstrating our commitment to information security best practices.{' '}
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 font-mono">
                        <Link2 className="h-3 w-3" />
                        ISO27001_Certificate.pdf, p.5
                      </span>
                    </p>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.2 Encryption Standards</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                      All data transmission and storage utilize AES-256 encryption, ensuring the highest level of data protection. Our encryption implementation has been validated through independent security audits.{' '}
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 font-mono">
                        <Link2 className="h-3 w-3" />
                        Security_Audit_2024.pdf, p.7
                      </span>
                    </p>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">3.3 Access Control</h3>
                    <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span>Click to add content - AI recommendations available →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: AI Intelligence (30%) */}
        <div className="w-[380px] border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <h2 className="font-semibold text-sm text-foreground">AI Recommendations</h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Relevant to current section
            </p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {recommendations.map((card) => (
                <div
                  key={card.id}
                  className="border border-border rounded-lg p-3 hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm text-foreground flex-1 pr-2">
                      {card.title}
                    </h3>
                    {getRiskBadge(card.riskLevel)}
                  </div>

                  {/* Confidence Meter */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Anchor Confidence</span>
                      <span className={`text-xs font-mono font-semibold ${
                        card.confidence >= 95 ? 'text-green-400' :
                        card.confidence >= 85 ? 'text-blue-400' :
                        card.confidence >= 70 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {card.confidence}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          card.confidence >= 95 ? 'bg-green-500' :
                          card.confidence >= 85 ? 'bg-blue-500' :
                          card.confidence >= 70 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${card.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {card.content}
                  </p>

                  {/* Sources */}
                  <div className="space-y-1 mb-3">
                    {card.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <Link2 className="h-3 w-3" />
                        <span className="truncate">{source.doc}</span>
                        <span className="text-xs">p.{source.page}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                    >
                      View Full
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default ProposalEditorPage;
