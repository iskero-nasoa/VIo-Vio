"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCall } from "@/context/CallContext";
import { ChatList } from "@/components/Chat/ChatList";
import { CallNotification } from "@/components/Chat/CallNotification";
import { CallModal } from "@/components/Chat/CallModal";
import { ThemeToggle } from "@/components/Common/ThemeToggle";
import { UserAvatar } from "@/components/Common/UserAvatar";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const {
    callState, incomingCall,
    localVideoRef, remoteVideoRef,
    answerCall, endCall, toggleAudio, toggleVideo,
  } = useCall();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading VioApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Call overlays ── */}
      {incomingCall && (
        <CallNotification
          callerId={incomingCall.callerId}
          callerUsername={incomingCall.callerUsername}
          callerAvatar={incomingCall.callerAvatar}
          type={incomingCall.type}
          onAnswer={answerCall}
          onReject={() => answerCall(false)}
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

      {/* ── Sidebar ── */}
      <aside
        className="w-72 flex flex-col shrink-0"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Profile row */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {/* Avatar + name + status */}
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
            <div className="relative shrink-0">
              <UserAvatar
                user={{ username: user.username, avatar: user.avatar, status: "online" }}
                size="md"
                showStatus={false}
              />
              {/* green dot */}
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "#22c55e", borderColor: "var(--card)" }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {user.username}
              </p>
              <p className="text-xs" style={{ color: "#22c55e" }}>online</p>
            </div>
          </Link>

          {/* Controls: theme toggle + logout */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <button
              onClick={logout}
              title="Log out"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--danger)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Chat list (includes search + action buttons + items) */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatList currentUserId={user.id} />
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
        {children}
      </main>
    </div>
  );
}
