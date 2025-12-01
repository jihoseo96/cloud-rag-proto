/**
 * DocumentsPage.tsx
 * Documents Management - RFP 관련 문서 관리
 * Upload → Documents 탭으로 변경
 */

import { useState } from 'react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { 
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

type DocumentStatus = 'completed' | 'processing' | 'error';

type Document = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  status: DocumentStatus;
  cardsGenerated?: number;
  processingProgress?: number;
};

function DocumentsPage() {
  const { projectId } = useParams();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-1',
      fileName: '제안서_보안정책_v2.pdf',
      fileType: 'pdf',
      fileSize: 2458624,
      uploadedAt: new Date('2024-11-20T10:30:00'),
      uploadedBy: 'john.doe@company.com',
      status: 'completed',
      cardsGenerated: 12
    },
    {
      id: 'doc-2',
      fileName: '인증서_ISO27001.pdf',
      fileType: 'pdf',
      fileSize: 524288,
      uploadedAt: new Date('2024-11-21T14:15:00'),
      uploadedBy: 'john.doe@company.com',
      status: 'completed',
      cardsGenerated: 3
    },
    {
      id: 'doc-3',
      fileName: '기술제안서_클라우드_v3.pdf',
      fileType: 'pdf',
      fileSize: 3145728,
      uploadedAt: new Date('2024-11-22T09:20:00'),
      uploadedBy: 'jane.smith@company.com',
      status: 'completed',
      cardsGenerated: 18
    },
    {
      id: 'doc-4',
      fileName: 'ISMS-P_인증서.pdf',
      fileType: 'pdf',
      fileSize: 614400,
      uploadedAt: new Date('2024-11-23T11:45:00'),
      uploadedBy: 'john.doe@company.com',
      status: 'completed',
      cardsGenerated: 2
    },
    {
      id: 'doc-5',
      fileName: '회사소개서_2024.pptx',
      fileType: 'pptx',
      fileSize: 4194304,
      uploadedAt: new Date('2024-11-24T16:00:00'),
      uploadedBy: 'alice.j@company.com',
      status: 'processing',
      processingProgress: 67
    },
    {
      id: 'doc-6',
      fileName: 'IDC_인증서.pdf',
      fileType: 'pdf',
      fileSize: 458752,
      uploadedAt: new Date('2024-11-25T08:30:00'),
      uploadedBy: 'john.doe@company.com',
      status: 'completed',
      cardsGenerated: 4
    }
  ]);

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleUpload = () => {
    // Upload logic here
    setUploadDialogOpen(false);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-[#D0362D]" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-[#0B57D0]" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5 text-[#0E7A4E]" />;
      case 'pptx':
      case 'ppt':
        return <File className="h-5 w-5 text-[#EFB81A]" />;
      default:
        return <File className="h-5 w-5 text-[#9AA0A6]" />;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#0E7A4E]/10 text-[#0E7A4E] border-[#0E7A4E]/30">완료</Badge>;
      case 'processing':
        return <Badge className="bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/30">처리중</Badge>;
      case 'error':
        return <Badge className="bg-[#D0362D]/10 text-[#D0362D] border-[#D0362D]/30">오류</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedDocs = documents.filter(d => d.status === 'completed').length;
  const processingDocs = documents.filter(d => d.status === 'processing').length;
  const totalCards = documents
    .filter(d => d.cardsGenerated)
    .reduce((sum, d) => sum + (d.cardsGenerated || 0), 0);

  return (
    <EnterpriseLayout projectId={projectId}>
      <div className="h-full flex flex-col bg-white">
        
        {/* Header */}
        <div className="border-b border-[#E0E0E0] bg-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-[1.25rem] font-semibold text-[#1F1F1F] mb-2">
                  Documents
                </h1>
                <p className="text-[0.875rem] text-[#9AA0A6]">
                  RFP 제안서 작성을 위한 소스 문서 관리
                </p>
              </div>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      PDF, Word, Excel, PowerPoint 파일을 업로드하세요
                    </DialogDescription>
                  </DialogHeader>
                  <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-[#9AA0A6] mx-auto mb-4" />
                    <p className="text-[0.875rem] text-[#424242] mb-2">
                      파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-[0.75rem] text-[#9AA0A6]">
                      최대 10MB · PDF, DOCX, XLSX, PPTX
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleUpload}>
                      Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-[0.8125rem]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0E7A4E]" />
                <span className="text-[#9AA0A6]">완료:</span>
                <span className="font-semibold text-[#1F1F1F]">{completedDocs}개</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0B57D0]" />
                <span className="text-[#9AA0A6]">처리중:</span>
                <span className="font-semibold text-[#1F1F1F]">{processingDocs}개</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0B57D0]" />
                <span className="text-[#9AA0A6]">생성된 카드:</span>
                <span className="font-semibold text-[#1F1F1F]">{totalCards}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F7F7F8] border-b border-[#E0E0E0]">
                  <tr className="text-[0.75rem] text-[#424242] uppercase tracking-wider">
                    <th className="text-left py-3 px-5 font-semibold">File</th>
                    <th className="text-left py-3 px-5 font-semibold">Type</th>
                    <th className="text-left py-3 px-5 font-semibold">Size</th>
                    <th className="text-left py-3 px-5 font-semibold">Status</th>
                    <th className="text-center py-3 px-5 font-semibold">Cards</th>
                    <th className="text-left py-3 px-5 font-semibold">Uploaded</th>
                    <th className="text-left py-3 px-5 font-semibold">By</th>
                    <th className="text-center py-3 px-5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-[#E0E0E0] hover:bg-[#F7F7F8] transition-colors"
                    >
                      {/* File */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileType)}
                          <span className="text-[0.875rem] font-medium text-[#1F1F1F]">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-5">
                        <Badge variant="outline" className="text-[0.6875rem] uppercase">
                          {doc.fileType}
                        </Badge>
                      </td>

                      {/* Size */}
                      <td className="py-4 px-5">
                        <span className="text-[0.8125rem] text-[#424242] mono">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <div>
                          {getStatusBadge(doc.status)}
                          {doc.status === 'processing' && doc.processingProgress && (
                            <div className="mt-2">
                              <Progress value={doc.processingProgress} className="h-1.5" />
                              <div className="text-[0.6875rem] text-[#9AA0A6] mt-1">
                                {doc.processingProgress}%
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cards Generated */}
                      <td className="py-4 px-5 text-center">
                        {doc.cardsGenerated !== undefined ? (
                          <span className="text-[0.875rem] font-semibold text-[#0B57D0] mono">
                            {doc.cardsGenerated}
                          </span>
                        ) : (
                          <span className="text-[0.875rem] text-[#9AA0A6]">—</span>
                        )}
                      </td>

                      {/* Uploaded Date */}
                      <td className="py-4 px-5">
                        <span className="text-[0.75rem] text-[#424242]">
                          {formatDate(doc.uploadedAt)}
                        </span>
                      </td>

                      {/* Uploaded By */}
                      <td className="py-4 px-5">
                        <span className="text-[0.75rem] text-[#424242]">
                          {doc.uploadedBy.split('@')[0]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4 text-[#9AA0A6]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4 text-[#9AA0A6]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-[#D0362D]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}

export default DocumentsPage;
