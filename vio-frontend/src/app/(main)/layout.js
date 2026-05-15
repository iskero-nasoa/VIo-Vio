"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import AuthGuard from '../../components/auth/AuthGuard';
import DashboardLayout from '../../components/chat/DashboardLayout';
import Navbar from '../../components/Navbar';
import ThemeProvider from '../../components/ThemeProvider';
import ToastContainer from '../../components/notifications/ToastContainer';
import IncomingCallModal from '../../components/calls/IncomingCallModal';
import MinimizedCallWidget from '../../components/calls/MinimizedCallWidget';
import { useCallStore } from '../../store/callStore';
import '../../styles/layout.css';
import '../../styles/messages.css';
import '../../styles/input.css';
import '../../styles/profile.css';
import '../../styles/calls.css';
import '../../styles/uploads.css';
import '../../styles/notifications.css';
import '../../styles/groups.css';
import '../../styles/search.css';
import '../../styles/mobile.css';
import '../../styles/tablet.css';

export default function MainLayout({ children }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { activeCall } = useCallStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !token) {
      router.push('/login');
    }
  }, [token, router, isClient]);

  if (!isClient) {
    return null;
  }

  if (!token) {
    return null;
  }

  return (
    <AuthGuard>
      <ThemeProvider>
        <Navbar />
        <ToastContainer />
        <IncomingCallModal />
        {activeCall && (
          <MinimizedCallWidget
            call={activeCall}
            onExpand={() => { }}
            onEnd={() => { }}
          />
        )}
        <div className="pt-16 h-screen overflow-hidden">
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}