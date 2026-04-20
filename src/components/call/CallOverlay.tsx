'use client';

import { Box, Typography, IconButton, Paper } from '@mui/material';
import { Call as CallIcon, Videocam as VideocamIcon, Mic as MicIcon, MicOff as MicOffIcon, VideocamOff as VideocamOffIcon, CallEnd as CallEndIcon } from '@mui/icons-material';
import { useCallStore } from '@/stores/callStore';
import { useAuthStore } from '@/stores/authStore';
import { webrtcManager } from '@/lib/webrtc';
import { emitCallEnd } from '@/lib/socket';
import { Avatar } from '@/components/ui/Avatar';
import { useState } from 'react';

export function CallOverlay() {
  const { activeCall, localStream, remoteStream, endCall, callType } = useCallStore();
  const { user } = useAuthStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (!activeCall) return null;

  const isVideoCall = callType === 'VIDEO';
  const otherUserId = activeCall.callerId === user?.id ? activeCall.calleeId : activeCall.callerId;

  const handleToggleMute = () => {
    webrtcManager.toggleAudio(isMuted);
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    webrtcManager.toggleVideo(isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  const handleEndCall = () => {
    emitCallEnd(activeCall.id);
    webrtcManager.close();
    endCall();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Typography variant="h5" sx={{ color: 'white', mb: 4 }}>
        {isVideoCall ? 'Video Call' : 'Voice Call'}
      </Typography>

      {isVideoCall && remoteStream && (
        <Box
          sx={{
            width: '80%',
            maxWidth: 800,
            aspectRatio: '16/9',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
            bgcolor: '#333',
          }}
        >
          <video
            autoPlay
            playsInline
            ref={(el) => {
              if (el) el.srcObject = remoteStream;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}

      {isVideoCall && localStream && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            width: 200,
            aspectRatio: '16/9',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: '#333',
            border: '2px solid white',
          }}
        >
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el) el.srcObject = localStream;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        <IconButton
          onClick={handleToggleMute}
          sx={{
            bgcolor: isMuted ? '#f44336' : 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': { bgcolor: isMuted ? '#d32f2f' : 'rgba(255,255,255,0.2)' },
          }}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>

        {isVideoCall && (
          <IconButton
            onClick={handleToggleVideo}
            sx={{
              bgcolor: isVideoOff ? '#f44336' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { bgcolor: isVideoOff ? '#d32f2f' : 'rgba(255,255,255,0.2)' },
            }}
          >
            {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        )}

        <IconButton
          onClick={handleEndCall}
          sx={{
            bgcolor: '#f44336',
            color: 'white',
            '&:hover': { bgcolor: '#d32f2f' },
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
