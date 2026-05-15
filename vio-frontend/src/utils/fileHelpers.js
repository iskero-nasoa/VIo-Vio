import { File, FileText, Film, Music, Image as ImageIcon } from 'lucide-react';
import { IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, DOCUMENT_TYPES } from '../constants/fileConstants';

export function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function getFileType(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  if (IMAGE_TYPES.includes(ext)) return 'image';
  if (VIDEO_TYPES.includes(ext)) return 'video';
  if (AUDIO_TYPES.includes(ext)) return 'audio';
  if (DOCUMENT_TYPES.includes(ext)) return 'document';
  return 'other';
}

export function getFileIcon(filename) {
  const type = getFileType(filename);
  switch (type) {
    case 'image': return ImageIcon;
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return FileText;
    default: return File;
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isPreviewable(filename) {
  const type = getFileType(filename);
  return ['image', 'video', 'audio'].includes(type);
}
