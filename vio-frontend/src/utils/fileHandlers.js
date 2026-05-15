export function validateFileSize(file, maxSizeInMB) {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds the ${maxSizeInMB}MB limit.` };
  }
  return { valid: true, error: null };
}

export function validateFileType(file, allowedTypes) {
  // allowedTypes is an array of extensions or mime types e.g. ['image/jpeg', '.pdf']
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  const isValid = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type);
    }
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0];
      return fileType.startsWith(`${baseType}/`);
    }
    return fileType === type;
  });

  if (!isValid) {
    return { valid: false, error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true, error: null };
}

export function getFileType(filename) {
  if (!filename) return 'document';
  
  const ext = filename.split('.').pop().toLowerCase();
  
  const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videos = ['mp4', 'webm', 'ogg', 'mov'];
  const audio = ['mp3', 'wav', 'ogg', 'm4a'];
  
  if (images.includes(ext)) return 'image';
  if (videos.includes(ext)) return 'video';
  if (audio.includes(ext)) return 'audio';
  
  return 'document';
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
