"use client";

import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { SendHorizontal, Paperclip, Smile, X, FileVideo, Loader2, Mic } from "lucide-react";
import { api } from "../../utils/api";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { VoiceRecorder } from "./VoiceRecorder";

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: any[]) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        alert("Only images and videos are allowed.");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
    // Don't close picker so user can add multiple emojis
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;
    if (disabled || isUploading) return;

    let attachments: any[] = [];
    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadRes = await api.uploadFile(selectedFile, (progressEvent: any) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });
        attachments.push(uploadRes);
      } catch (error) {
        alert("Upload failed.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSendMessage(trimmed, attachments);
    setText("");
    clearFile();
    onTyping(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceSend = async (blob: Blob) => {
    setIsRecording(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a file from the blob
      const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
      const uploadRes = await api.uploadFile(file, (progressEvent: any) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      onSendMessage("", [{ ...uploadRes, type: "audio" }]);
    } catch (error) {
      console.error("Voice upload failed:", error);
      alert("Failed to send voice message.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col bg-card space-y-2 relative">
      {/* File Preview */}
      {selectedFile && (
        <div className="relative flex items-center bg-secondary p-2 rounded-lg self-start max-w-sm group border border-border transition-all animate-fadeIn">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded mr-3" />
          ) : (
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mr-3">
              <FileVideo className="text-muted-foreground" size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs text-foreground truncate font-medium">{selectedFile.name}</p>
            <p className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
          </div>
          
          <button 
            onClick={clearFile}
            className="absolute -top-2 -right-2 bg-secondary hover:bg-red-500 text-foreground hover:text-white rounded-full p-1 shadow-sm transition-all"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg transition-all ${
              showEmojiPicker ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-16 left-0 z-50 animate-fadeIn"
            >
              <EmojiPicker
                theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                searchPlaceholder="Поиск эмодзи..."
              />
            </div>
          )}
        </div>

        {isRecording ? (
          <VoiceRecorder 
            onSend={handleVoiceSend}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <>
            <input 
              type="text"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type message..."
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:border-primary outline-none text-sm placeholder-muted-foreground transition-all"
            />
            
            {text.trim() || selectedFile ? (
              <button 
                onClick={handleSend}
                disabled={disabled || isUploading}
                className="p-2 text-primary hover:text-primary/80 transition-all disabled:opacity-30 active:scale-95"
              >
                {isUploading ? (
                  <div className="relative">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">
                      {uploadProgress}
                    </span>
                  </div>
                ) : (
                  <SendHorizontal size={24} />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-all active:scale-90"
              >
                <Mic size={24} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
