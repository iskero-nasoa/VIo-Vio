"use client";

import { useAuth } from "@/hooks/useAuth";
import { GroupChatWindow } from "@/components/Chat/GroupChatWindow";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function GroupChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const groupId = params.id as string;

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2 md:p-6">
      <GroupChatWindow groupId={groupId} currentUserId={user.id} />
    </div>
  );
}
