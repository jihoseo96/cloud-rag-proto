import { FileText, File, Image, Video, Music, Archive, Code } from 'lucide-react';

interface FileIconProps {
  extension: string;
  className?: string;
}

export function FileIcon({ extension, className = "w-3 h-3" }: FileIconProps) {
  const ext = extension.toLowerCase().replace('.', '');
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className={className} />;
  }
  
  // Spreadsheet files
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileText className={className} />;
  }
  
  // Presentation files
  if (['ppt', 'pptx', 'key'].includes(ext)) {
    return <FileText className={className} />;
  }
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return <Image className={className} />;
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return <Video className={className} />;
  }
  
  // Audio files
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    return <Music className={className} />;
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive className={className} />;
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext)) {
    return <Code className={className} />;
  }
  
  // Default
  return <File className={className} />;
}

export function getFileExtensionColor(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  
  if (['pdf'].includes(ext)) return 'text-red-600';
  if (['doc', 'docx'].includes(ext)) return 'text-blue-600';
  if (['xls', 'xlsx'].includes(ext)) return 'text-green-600';
  if (['ppt', 'pptx'].includes(ext)) return 'text-orange-600';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-purple-600';
  if (['zip', 'rar', '7z'].includes(ext)) return 'text-yellow-600';
  
  return 'text-[#718096]';
}
