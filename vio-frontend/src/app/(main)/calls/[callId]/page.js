"use client";

import { useEffect } from 'react';
import ActiveCallScreen from '../../../../components/calls/ActiveCallScreen';
import { useCallStore } from '../../../../store/callStore';
import { useCall } from '../../../../hooks/useCall';

export default function CallPage({ params }) {
  const { callId } = params;
  const { activeCall } = useCallStore();
  const { getOngoingCalls } = useCall();

  useEffect(() => {
    if (!activeCall) {
      getOngoingCalls();
    }
  }, [activeCall, getOngoingCalls]);

  return <ActiveCallScreen callId={callId} />;
}
