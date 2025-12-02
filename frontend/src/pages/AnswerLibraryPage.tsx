/**
 * AnswerLibraryPage.tsx
 * Answer Library - Knowledge Asset Management
 */

import { useState, useEffect } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Edit,
    Trash2,
    Filter,
    Loader2
} from 'lucide-react';
import { answersApi, AnswerCard } from '../api/answers';

function AnswerLibraryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [answers, setAnswers] = useState<AnswerCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnswers();
    }, [searchQuery]); // Reload when search query changes (debounce ideally)

    const loadAnswers = async () => {
        try {
            setIsLoading(true);
            const data = await answersApi.listAnswers(undefined, undefined, searchQuery);
            // Convert date strings to Date objects if needed for sorting/display
            // The API returns ISO strings, but the UI might expect Date objects if we use methods like .toLocaleDateString()
            // Let's map it.
            const processed = data.map(item => ({
                ...item,
                lastUsed: item.lastUsed ? new Date(item.lastUsed) : undefined,
                // Ensure other fields are present
                usageCount: item.usageCount || 0
            }));
            setAnswers(processed);
        } catch (e) {
            console.error("Failed to load answers", e);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: AnswerCard['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case 'candidate':
                return (
                    <Badge className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]">
                        <Clock className="h-3 w-3 mr-1" />
                        Candidate
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-[#9AA0A6]/10 text-[#424242] border-[#E0E0E0]">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <EnterpriseLayout>
            <div className="h-full flex flex-col bg-white">
                {/* Header */}
                <div className="h-16 border-b border-[#E0E0E0] flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-[1.125rem] font-semibold text-[#1F1F1F]">Answer Library</h1>
                        <p className="text-[0.75rem] text-[#9AA0A6] mt-0.5">
                            승인된 답변 카드 및 지식 자산 관리
                        </p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="h-16 border-b border-[#E0E0E0] flex items-center px-6 gap-3 bg-[#F7F7F8]">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
                        <Input
                            placeholder="토픽, 키워드로 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-white"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                        필터
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#0B57D0]" />
                            </div>
                        ) : answers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                검색 결과가 없습니다.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {answers.map((answer) => (
                                    <div
                                        key={answer.id}
                                        className="border border-[#E0E0E0] rounded-lg p-5 hover:shadow-minimal transition-all cursor-pointer"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-[0.9375rem] font-semibold text-[#1F1F1F]">
                                                {answer.topic || answer.question}
                                            </h3>
                                            {getStatusBadge(answer.status)}
                                        </div>

                                        {/* Summary */}
                                        <p className="text-[0.8125rem] text-[#424242] leading-relaxed mb-4 line-clamp-2">
                                            {answer.summary || answer.answer}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-[0.75rem] text-[#9AA0A6]">
                                            <div className="flex items-center gap-4">
                                                {answer.lastUsed && (
                                                    <span>최근 사용: {answer.lastUsed instanceof Date ? answer.lastUsed.toLocaleDateString('ko-KR') : answer.lastUsed}</span>
                                                )}
                                                <span>사용: {answer.usageCount}회</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button className="p-1 hover:bg-[#F7F7F8] rounded">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                                <button className="p-1 hover:bg-[#F7F7F8] rounded">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Approved By */}
                                        {answer.reviewed_by && (
                                            <div className="mt-3 pt-3 border-t border-[#E0E0E0] text-[0.75rem] text-[#9AA0A6]">
                                                승인: {answer.reviewed_by}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EnterpriseLayout>
    );
}

export default AnswerLibraryPage;
