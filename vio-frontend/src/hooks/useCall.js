import { useState } from 'react';
import api from '../utils/api';
import { useCallStore } from '../store/callStore';
import { useSocketEmit } from './useSocketEmit';

export function useCall() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    activeCall, 
    setActiveCall, 
    setIncomingCall, 
    clearActiveCall, 
    clearIncomingCall,
    setCallHistory,
    setOngoingCalls
  } = useCallStore();

  const { emitInitiateCall, emitAcceptCall, emitRejectCall, emitEndCall } = useSocketEmit();

  const initiateCall = async (recipientId, callType = 'audio') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/calls/initiate', { recipientId, callType });
      const call = response.data;
      setActiveCall(call);
      emitInitiateCall(recipientId, callType);
      return call;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate call');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptCall = async (callId) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/calls/${callId}/accept`);
      const call = response.data;
      setActiveCall(call);
      clearIncomingCall();
      emitAcceptCall(callId);
      return call;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept call');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectCall = async (callId) => {
    setIsLoading(true);
    try {
      await api.post(`/calls/${callId}/reject`);
      clearIncomingCall();
      emitRejectCall(callId);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject call');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = async (callId) => {
    setIsLoading(true);
    try {
      await api.post(`/calls/${callId}/end`);
      clearActiveCall();
      emitEndCall(callId);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end call');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCallHistory = async () => {
    try {
      const response = await api.get('/calls/history');
      setCallHistory(response.data);
    } catch (err) {
      console.error('Failed to get call history', err);
    }
  };

  const getOngoingCalls = async () => {
    try {
      const response = await api.get('/calls/ongoing');
      setOngoingCalls(response.data);
    } catch (err) {
      console.error('Failed to get ongoing calls', err);
    }
  };

  return {
    callData: activeCall,
    isLoading,
    error,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
    getOngoingCalls
  };
}
