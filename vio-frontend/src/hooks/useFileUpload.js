import { useState, useRef } from 'react';
import api from '../utils/api';

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllers = useRef({});

  const uploadFile = async (file, chatId) => {
    setIsUploading(true);
    setUploadError(null);
    
    const controller = new AbortController();
    abortControllers.current[file.name] = controller;

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('chatId', chatId);

    try {
      const response = await api.post('/messages/attachment/upload', formData, {
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        }
      });
      
      delete abortControllers.current[file.name];
      return response.data; // { url, filename, fileType, size }
    } catch (err) {
      if (err.name === 'CanceledError') {
        console.log('Upload canceled:', file.name);
      } else {
        setUploadError(`Failed to upload ${file.name}`);
      }
      return null;
    } finally {
      if (Object.keys(abortControllers.current).length === 0) {
        setIsUploading(false);
      }
    }
  };

  const cancelUpload = (filename) => {
    if (abortControllers.current[filename]) {
      abortControllers.current[filename].abort();
      delete abortControllers.current[filename];
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[filename];
        return next;
      });
    }
  };

  return {
    uploadFile,
    uploadProgress,
    uploadError,
    isUploading,
    cancelUpload,
    clearErrors: () => setUploadError(null)
  };
}
