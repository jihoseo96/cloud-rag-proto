import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface GroupInstructionEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTitle?: string;
    initialContent: string;
    onSave: (title: string, content: string) => Promise<void>;
}

export function GroupInstructionEditDialog({
    open,
    onOpenChange,
    initialTitle = '',
    initialContent,
    onSave
}: GroupInstructionEditDialogProps) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(initialTitle);
        setContent(initialContent);
    }, [initialTitle, initialContent, open]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;

        setIsSaving(true);
        try {
            await onSave(title, content);
            onOpenChange(false);
        } catch (e) {
            console.error('Failed to save instruction', e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>그룹 프롬프트 설정</DialogTitle>
                    <DialogDescription>
                        이 팀의 모든 멤버가 공유할 전문 프롬프트를 설정합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">프롬프트 제목</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 마케팅 전문가 페르소나"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instruction">프롬프트 내용</Label>
                        <Textarea
                            id="instruction"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="예: 당신은 마케팅 전문가입니다. 모든 답변은..."
                            className="h-[300px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        취소
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim() || !content.trim()}
                        className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] text-white"
                    >
                        {isSaving ? '저장 중...' : '저장하기'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
