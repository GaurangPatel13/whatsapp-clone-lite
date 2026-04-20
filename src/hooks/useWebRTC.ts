'use client';

import { useState, useEffect, useCallback } from 'react';
import { webrtcManager } from '@/lib/webrtc';
import { useCallStore } from '@/stores/callStore';
import { emitCallAnswer, emitCallIceCandidate, emitCallEnd } from '@/lib/socket';

export function useWebRTC() {
  const { activeCall, setRemoteStream, endCall } = useCallStore();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const initializeCall = useCallback(async (isVideo: boolean, remoteUserId: string) => {
    try {
      const stream = await webrtcManager.getLocalStream(isVideo);
      setLocalStream(stream);

      await webrtcManager.initialize(
        (remoteStream) => {
          setRemoteStream(remoteStream);
        },
        (candidate) => {
          emitCallIceCandidate(remoteUserId, candidate.toJSON());
        }
      );

      const offer = await webrtcManager.createOffer();
      return offer;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      throw error;
    }
  }, [setRemoteStream]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, callerId: string) => {
    try {
      await webrtcManager.initialize(
        (remoteStream) => {
          setRemoteStream(remoteStream);
        },
        (candidate) => {
          emitCallIceCandidate(callerId, candidate.toJSON());
        }
      );

      const answer = await webrtcManager.createAnswer(offer);
      emitCallAnswer(callerId, answer);
      return answer;
    } catch (error) {
      console.error('Failed to handle offer:', error);
      throw error;
    }
  }, [setRemoteStream]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      await webrtcManager.handleAnswer(answer);
    } catch (error) {
      console.error('Failed to handle answer:', error);
      throw error;
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      await webrtcManager.addIceCandidate(candidate);
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }, []);

  const endCurrentCall = useCallback(() => {
    if (activeCall) {
      emitCallEnd(activeCall.id);
    }
    webrtcManager.close();
    endCall();
    setLocalStream(null);
  }, [activeCall, endCall]);

  useEffect(() => {
    return () => {
      webrtcManager.close();
    };
  }, []);

  return {
    localStream,
    initializeCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    endCurrentCall,
  };
}
