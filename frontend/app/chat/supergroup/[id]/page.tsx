"use client";

import { useAuth } from "@/hooks/useAuth";
import { SupergroupChatWindow } from "@/components/Chat/SupergroupChatWindow";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SupergroupPage() {
  const { user } = useAuth();
  const params = useParams();
  const supergroupId = params.id as string;

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <SupergroupChatWindow
        supergroupId={supergroupId}
        currentUserId={user.id}
      />
    </div>
  );
}
