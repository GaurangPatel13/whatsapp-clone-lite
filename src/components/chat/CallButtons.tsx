'use client';

import { IconButton, Tooltip } from '@mui/material';
import { Phone as PhoneIcon, Videocam as VideocamIcon } from '@mui/icons-material';
import { useCallStore } from '@/stores/callStore';
import { webrtcManager } from '@/lib/webrtc';
import { emitCallOffer } from '@/lib/socket';
import type { User, CallType } from '@/types';

interface CallButtonsProps {
  user: User;
}

export function CallButtons({ user }: CallButtonsProps) {
  const { startCall, setReceivingCall, activeCall } = useCallStore();

  const handleCall = async (type: CallType) => {
    try {
      const stream = await webrtcManager.getLocalStream(type === 'VIDEO');
      const offer = await webrtcManager.createOffer();
      emitCallOffer(user.id, offer);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  return (
    <>
      <Tooltip title="Voice call">
        <IconButton onClick={() => handleCall('VOICE')} disabled={!!activeCall}>
          <PhoneIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Video call">
        <IconButton onClick={() => handleCall('VIDEO')} disabled={!!activeCall}>
          <VideocamIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
