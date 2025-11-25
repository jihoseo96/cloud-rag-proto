import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Users, Paperclip, MoreVertical, Sparkles, Check, X, Loader2, ZoomIn, ZoomOut, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  uploader?: string;
  date?: string;
  parentId: string | null;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'pending' | 'applied' | 'rejected';
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

interface DocumentViewerProps {
  file: FileItem;
  onBack: () => void;
}

export default function DocumentViewer({ file, onBack }: DocumentViewerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! 문서 편집을 도와드리겠습니다. 어떤 부분을 수정하시겠어요?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Sarah Kim', color: '#4A7BA7', active: true },
    { id: '2', name: 'John Smith', color: '#7B9FB5', active: true },
    { id: '3', name: 'David Lee', color: '#8BA5B8', active: false },
  ]);

  // Mock document content based on file type
  const [documentContent, setDocumentContent] = useState<any>(() => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return {
        type: 'excel',
        sheets: ['Sheet1', 'Sheet2'],
        activeSheet: 0,
        data: [
          ['항목', 'Q1', 'Q2', 'Q3', 'Q4', '합계'],
          ['매출', '1,200', '1,450', '1,680', '1,920', '6,250'],
          ['비용', '800', '850', '920', '1,050', '3,620'],
          ['순이익', '400', '600', '760', '870', '2,630'],
          ['성장률', '5%', '8%', '12%', '15%', '10%'],
        ]
      };
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return {
        type: 'word',
        content: `# 프로젝트 제안서

## 1. 개요
본 프로젝트는 AI 기반 협업 플랫폼 개발을 목표로 합니다.

## 2. 주요 목표
- 실시간 공동 작업 환경 구축
- AI 어시스턴트 통합
- 클라우드 기반 파일 관리

## 3. 예상 일정
- 1단계: 기획 및 설계 (4주)
- 2단계: 개발 (12주)
- 3단계: 테스트 및 배포 (4주)

## 4. 예산 계획
총 예산: 150,000,000원
- 인건비: 100,000,000원
- 인프라: 30,000,000원
- 기타: 20,000,000원`
      };
    } else if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
      return {
        type: 'powerpoint',
        slides: [
          { id: 1, title: '2024 마케팅 전략', content: '성공적인 디지털 전환을 위한 로드맵' },
          { id: 2, title: '시장 분석', content: '• 목표 고객층 확대\n• 경쟁사 분석\n• 시장 기회 요인' },
          { id: 3, title: '실행 계획', content: '• SNS 마케팅 강화\n• 콘텐츠 마케팅\n• 인플루언서 협업' },
          { id: 4, title: '예상 성과', content: '• 매출 30% 증가 목표\n• 브랜드 인지도 향상\n• 고객 만족도 개선' },
        ],
        activeSlide: 0
      };
    } else if (file.name.endsWith('.pdf')) {
      return {
        type: 'pdf',
        totalPages: 5,
        currentPage: 1,
        zoom: 100,
        pages: [
          {
            title: '마케팅 전략 보고서',
            content: '2024년 디지털 마케팅 전략 및 실행 계획',
            sections: ['개요', '시장 분석', '경쟁사 분석', '목표 설정']
          },
          {
            title: '시장 분석',
            content: '현재 시장 동향 및 기회 요인 분석',
            sections: ['시장 규모', '성장률', '주요 트렌드', '고객 세분화']
          },
          {
            title: '실행 계획',
            content: '단계별 실행 전략 및 일정',
            sections: ['1단계: 준비', '2단계: 실행', '3단계: 평가', '4단계: 최적화']
          },
          {
            title: '예산 및 리소스',
            content: '필요 예산 및 인력 배치 계획',
            sections: ['총 예산: 150,000,000원', '마케팅팀: 5명', '디자인팀: 3명', '개발팀: 4명']
          },
          {
            title: '예상 성과',
            content: '목표 KPI 및 예상 ROI',
            sections: ['매출 30% 증가', '브랜드 인지도 40% 향상', 'ROI 250%', '고객 만족도 85%']
          }
        ]
      };
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `"${inputMessage}" 요청을 처리했습니다. 문서에 변경사항이 반영되었습니다.`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'applied'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);

      // Simulate document update
      if (documentContent.type === 'excel' && inputMessage.includes('매출')) {
        setDocumentContent((prev: any) => ({
          ...prev,
          data: prev.data.map((row: string[], idx: number) => 
            idx === 1 ? ['매출', '1,300', '1,550', '1,780', '2,020', '6,650'] : row
          )
        }));
      } else if (documentContent.type === 'word' && inputMessage.includes('예산')) {
        setDocumentContent((prev: any) => ({
          ...prev,
          content: prev.content.replace('150,000,000원', '180,000,000원')
        }));
      } else if (documentContent.type === 'pdf' && inputMessage.includes('페이지')) {
        // PDF navigation example
        const pageMatch = inputMessage.match(/(\d+)/);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1]);
          if (pageNum >= 1 && pageNum <= documentContent.totalPages) {
            setDocumentContent((prev: any) => ({
              ...prev,
              currentPage: pageNum
            }));
          }
        }
      }
    }, 1500);
  };

  const renderDocumentContent = () => {
    if (documentContent.type === 'excel') {
      return (
        <div className="flex flex-col h-full bg-white">
          {/* Excel Toolbar */}
          <div className="border-b border-[#E9EDF7] px-4 py-2 flex items-center gap-2 bg-[#f4f7fe]">
            <div className="flex gap-1">
              {documentContent.sheets.map((sheet: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setDocumentContent((prev: any) => ({ ...prev, activeSheet: idx }))}
                  className={`px-4 py-1.5 text-[13px] rounded-t transition-colors ${
                    documentContent.activeSheet === idx
                      ? 'bg-white text-[#1b2559] font-medium border-t-2 border-[#0EA5E9]'
                      : 'text-[#718096] hover:bg-white/50'
                  }`}
                >
                  {sheet}
                </button>
              ))}
            </div>
          </div>

          {/* Excel Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="inline-block min-w-full">
              <table className="border-collapse">
                <tbody>
                  {documentContent.data.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td
                          key={cellIdx}
                          className={`border border-[#E9EDF7] px-4 py-2 min-w-[120px] ${
                            rowIdx === 0
                              ? 'bg-gradient-to-r from-[#0EA5E9]/10 to-[#8B5CF6]/10 font-semibold text-[#1b2559]'
                              : cellIdx === 0
                              ? 'bg-[#f4f7fe] font-medium text-[#1b2559]'
                              : 'bg-white text-[#1b2559]'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    } else if (documentContent.type === 'word') {
      return (
        <div className="flex flex-col h-full bg-[#f4f7fe]">
          {/* Word Toolbar */}
          <div className="border-b border-[#E9EDF7] px-4 py-3 bg-white flex items-center gap-4">
            <div className="flex gap-2 text-[13px] text-[#718096]">
              <button className="px-3 py-1 hover:bg-[#f4f7fe] rounded">파일</button>
              <button className="px-3 py-1 hover:bg-[#f4f7fe] rounded">홈</button>
              <button className="px-3 py-1 hover:bg-[#f4f7fe] rounded">삽입</button>
              <button className="px-3 py-1 hover:bg-[#f4f7fe] rounded">디자인</button>
              <button className="px-3 py-1 hover:bg-[#f4f7fe] rounded">레이아웃</button>
            </div>
          </div>

          {/* Word Document */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-12">
              <div className="prose prose-slate max-w-none">
                {documentContent.content.split('\n').map((line: string, idx: number) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-[32px] font-semibold text-[#1b2559] mb-6 mt-0">{line.replace('# ', '')}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-[24px] font-semibold text-[#1b2559] mb-4 mt-8">{line.replace('## ', '')}</h2>;
                  } else if (line.startsWith('- ')) {
                    return <li key={idx} className="text-[16px] text-[#1b2559] ml-6">{line.replace('- ', '')}</li>;
                  } else if (line.trim()) {
                    return <p key={idx} className="text-[16px] text-[#1b2559] mb-4 leading-relaxed">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (documentContent.type === 'pdf') {
      return (
        <div className="flex flex-col h-full bg-[#525659]">
          {/* PDF Toolbar */}
          <div className="border-b border-[#404040] px-4 py-3 bg-[#323639] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocumentContent((prev: any) => ({ 
                    ...prev, 
                    currentPage: Math.max(1, prev.currentPage - 1) 
                  }))}
                  disabled={documentContent.currentPage === 1}
                  className="text-white hover:bg-[#404040]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-[14px] text-white min-w-[100px] text-center">
                  {documentContent.currentPage} / {documentContent.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocumentContent((prev: any) => ({ 
                    ...prev, 
                    currentPage: Math.min(prev.totalPages, prev.currentPage + 1) 
                  }))}
                  disabled={documentContent.currentPage === documentContent.totalPages}
                  className="text-white hover:bg-[#404040]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-[#404040]"></div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocumentContent((prev: any) => ({ 
                    ...prev, 
                    zoom: Math.max(50, prev.zoom - 10) 
                  }))}
                  className="text-white hover:bg-[#404040]"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-[14px] text-white min-w-[60px] text-center">
                  {documentContent.zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocumentContent((prev: any) => ({ 
                    ...prev, 
                    zoom: Math.min(200, prev.zoom + 10) 
                  }))}
                  className="text-white hover:bg-[#404040]"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#404040]"
            >
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div 
              className="bg-white shadow-2xl rounded-lg transition-all duration-200"
              style={{ 
                width: `${8.5 * documentContent.zoom}px`,
                minHeight: `${11 * documentContent.zoom}px`,
                transform: `scale(${documentContent.zoom / 100})`
              }}
            >
              {documentContent.pages[documentContent.currentPage - 1] && (
                <div className="p-16">
                  {/* PDF Page Header */}
                  <div className="mb-8 border-b-2 border-[#0EA5E9] pb-4">
                    <h1 className="text-[32px] font-semibold text-[#1b2559] mb-2">
                      {documentContent.pages[documentContent.currentPage - 1].title}
                    </h1>
                    <p className="text-[16px] text-[#718096]">
                      {documentContent.pages[documentContent.currentPage - 1].content}
                    </p>
                  </div>

                  {/* PDF Page Content */}
                  <div className="space-y-6">
                    {documentContent.pages[documentContent.currentPage - 1].sections.map((section: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[14px] font-semibold">{idx + 1}</span>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-[18px] text-[#1b2559] leading-relaxed">
                            {section}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PDF Page Footer */}
                  <div className="mt-12 pt-6 border-t border-[#E9EDF7] flex justify-between items-center text-[12px] text-[#718096]">
                    <div>Team AI Agent - 문서 뷰어</div>
                    <div>페이지 {documentContent.currentPage} / {documentContent.totalPages}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (documentContent.type === 'powerpoint') {
      return (
        <div className="flex flex-col h-full bg-[#2d2d2d]">
          {/* PowerPoint Toolbar */}
          <div className="border-b border-[#404040] px-4 py-2 bg-[#1f1f1f] flex items-center justify-between">
            <div className="flex gap-2 text-[13px] text-[#e0e0e0]">
              <button className="px-3 py-1 hover:bg-[#404040] rounded">파일</button>
              <button className="px-3 py-1 hover:bg-[#404040] rounded">홈</button>
              <button className="px-3 py-1 hover:bg-[#404040] rounded">삽입</button>
              <button className="px-3 py-1 hover:bg-[#404040] rounded">디자인</button>
              <button className="px-3 py-1 hover:bg-[#404040] rounded">전환</button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Slide Thumbnails */}
            <div className="w-48 bg-[#1f1f1f] border-r border-[#404040] p-3 overflow-y-auto">
              {documentContent.slides.map((slide: any, idx: number) => (
                <button
                  key={slide.id}
                  onClick={() => setDocumentContent((prev: any) => ({ ...prev, activeSlide: idx }))}
                  className={`w-full mb-2 p-2 rounded transition-all ${
                    documentContent.activeSlide === idx
                      ? 'bg-[#4A7BA7]/20 ring-2 ring-[#4A7BA7]'
                      : 'bg-[#2d2d2d] hover:bg-[#404040]'
                  }`}
                >
                  <div className="aspect-video bg-white rounded flex items-center justify-center">
                    <div className="text-[10px] text-[#1b2559] font-medium text-center px-2">
                      <div className="mb-1">{idx + 1}</div>
                      <div className="text-[8px] text-[#718096]">{slide.title}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Slide View */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-5xl aspect-video bg-white rounded-lg shadow-2xl p-12 flex flex-col justify-center">
                {documentContent.slides[documentContent.activeSlide] && (
                  <>
                    <h1 className="text-[48px] font-semibold text-[#1b2559] mb-8 text-center">
                      {documentContent.slides[documentContent.activeSlide].title}
                    </h1>
                    <div className="text-[24px] text-[#1b2559] whitespace-pre-line text-center">
                      {documentContent.slides[documentContent.activeSlide].content}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* AI Chat Sidebar */}
      <div className={`${isChatCollapsed ? 'w-0' : 'w-96'} border-r border-[#E9EDF7] bg-white flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-[#E9EDF7] bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">AI 어시스턴트</h3>
          </div>
          <p className="text-[12px] text-white/80">문서 편집을 도와드립니다</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] text-white'
                      : 'bg-[#f4f7fe] text-[#1b2559]'
                  }`}
                >
                  <p className="text-[14px]">{message.content}</p>
                  {message.status && (
                    <div className="flex items-center gap-1 mt-2 text-[11px]">
                      {message.status === 'applied' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>적용됨</span>
                        </>
                      ) : message.status === 'pending' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>처리 중...</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-[#f4f7fe] rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2 text-[14px] text-[#718096]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#E9EDF7]">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="문서 수정 요청을 입력하세요..."
              className="flex-1 border-[#E9EDF7]"
              disabled={isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 flex gap-1 flex-wrap">
            {documentContent?.type === 'excel' && (
              <button
                onClick={() => setInputMessage('매출 데이터를 10% 증가시켜줘')}
                className="text-[11px] px-2 py-1 rounded bg-[#f4f7fe] text-[#0EA5E9] hover:bg-[#E0F2FE]"
              >
                매출 10% 증가
              </button>
            )}
            {documentContent?.type === 'word' && (
              <button
                onClick={() => setInputMessage('예산을 20% 증액해줘')}
                className="text-[11px] px-2 py-1 rounded bg-[#f4f7fe] text-[#0EA5E9] hover:bg-[#E0F2FE]"
              >
                예산 증액
              </button>
            )}
            {documentContent?.type === 'powerpoint' && (
              <button
                onClick={() => setInputMessage('슬라이드에 차트 추가해줘')}
                className="text-[11px] px-2 py-1 rounded bg-[#f4f7fe] text-[#0EA5E9] hover:bg-[#E0F2FE]"
              >
                차트 추가
              </button>
            )}
            {documentContent?.type === 'pdf' && (
              <>
                <button
                  onClick={() => setInputMessage('3페이지로 이동해줘')}
                  className="text-[11px] px-2 py-1 rounded bg-[#f4f7fe] text-[#0EA5E9] hover:bg-[#E0F2FE]"
                >
                  3페이지 이동
                </button>
                <button
                  onClick={() => setInputMessage('다음 페이지')}
                  className="text-[11px] px-2 py-1 rounded bg-[#f4f7fe] text-[#0EA5E9] hover:bg-[#E0F2FE]"
                >
                  다음 페이지
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E9EDF7] px-6 py-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-[20px] font-semibold text-[#1b2559]">{file.name}</h2>
              <p className="text-[12px] text-[#718096]">
                {file.uploader}님이 {file.date}에 업로드
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {collaborators.filter(c => c.active).map((collab) => (
                  <div
                    key={collab.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold ring-2 ring-white"
                    style={{ backgroundColor: collab.color }}
                    title={collab.name}
                  >
                    {collab.name.charAt(0)}
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">
                <div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div>
                공동 작업 중
              </Badge>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className="border-[#E9EDF7] text-[#718096] hover:text-[#0EA5E9] hover:bg-[#f0f9ff]"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-hidden">
          {renderDocumentContent()}
        </div>
      </div>
    </div>
  );
}