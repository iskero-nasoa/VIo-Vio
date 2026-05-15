import { getFileExtension } from './fileHelpers';

export function validateFileType(file, allowedExtensions) {
  const ext = getFileExtension(file.name).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    return { valid: true };
  }
  return { 
    valid: false, 
    error: `Invalid file type. Supported types: ${allowedExtensions.join(', ')}` 
  };
}

export function validateFileSize(file, maxSize) {
  if (file.size <= maxSize) {
    return { valid: true };
  }
  const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
  return { 
    valid: false, 
    error: `File is too large. Maximum size is ${sizeInMB}MB` 
  };
}

export function validateFiles(files, allowedExtensions, maxSize) {
  const validFiles = [];
  const errors = [];

  Array.from(files).forEach(file => {
    const typeCheck = validateFileType(file, allowedExtensions);
    const sizeCheck = validateFileSize(file, maxSize);

    if (!typeCheck.valid) {
      errors.push(`${file.name}: ${typeCheck.error}`);
    } else if (!sizeCheck.valid) {
      errors.push(`${file.name}: ${sizeCheck.error}`);
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, errors };
}
