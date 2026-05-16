"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCall } from "@/context/CallContext";
import { ChatList } from "@/components/Chat/ChatList";
import { CallNotification } from "@/components/Chat/CallNotification";
import { CallModal } from "@/components/Chat/CallModal";
import { LogOut, MessageCircle, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/Common/UserAvatar";
import { ThemeToggle } from "@/components/Common/ThemeToggle";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const {
    callState,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useCall();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Call UI */}
      {incomingCall && (
        <CallNotification
          callerId={incomingCall.callerId}
          callerUsername={incomingCall.callerUsername}
          callerAvatar={incomingCall.callerAvatar}
          type={incomingCall.type}
          onAnswer={answerCall}
          onReject={rejectCall}
        />
      )}

      {callState.status !== "idle" && (
        <CallModal
          callState={callState}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onEndCall={endCall}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
        />
      )}

      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <UserAvatar user={{ username: user.username, avatar: user.avatar }} size="sm" />
              <span className="font-bold text-sm truncate max-w-[120px]">{user.username}</span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-red-500 p-2 transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <ChatList currentUserId={user.id} />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-background relative">
        {children}
      </main>
    </div>
  );
}
