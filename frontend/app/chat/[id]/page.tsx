"use client";

import { useAuth } from "@/hooks/useAuth";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

export default function SingleChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const chatId = params.id as string;
  const [recipient, setRecipient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !user) return;

    const fetchChatDetails = async () => {
      try {
        // Fetch chat details to get participants (for chatName)
        const chatData = await api.getChats(); // For simplicity, find it in the list
        const chat = chatData.find((c: any) => c._id === chatId);
        if (chat) {
          const other = chat.participants.find((p: any) => p._id !== user.id) || chat.participants[0];
          setRecipient(other);
        }
      } catch (error) {
        console.error("Failed to load chat details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId, user]);

  if (!user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2 md:p-6">
      <ChatWindow 
        chatId={chatId} 
        currentUserId={user.id} 
        recipient={recipient} 
      />
    </div>
  );
}
