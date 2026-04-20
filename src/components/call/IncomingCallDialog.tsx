'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Call as CallIcon, Videocam as VideocamIcon } from '@mui/icons-material';
import { useCallStore } from '@/stores/callStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import { webrtcManager } from '@/lib/webrtc';
import { emitCallAnswer } from '@/lib/socket';
import type { Call } from '@/types';

export function IncomingCallDialog() {
  const { activeCall, isReceivingCall, setRemoteStream, endCall, startCall } = useCallStore();
  const { user } = useAuthStore();
  const { conversations } = useChatStore();

  if (!isReceivingCall || !activeCall) return null;

  const callerId = activeCall.callerId;
  const caller = conversations
    .flatMap((c) => c.participants)
    .find((p) => p.userId === callerId)?.user;

  const isVideoCall = activeCall.type === 'VIDEO';

  const handleAccept = async () => {
    try {
      const localStream = await webrtcManager.getLocalStream(isVideoCall);
      startCall(activeCall, localStream);
    } catch (error) {
      console.error('Failed to accept call:', error);
      endCall();
    }
  };

  const handleReject = () => {
    webrtcManager.close();
    endCall();
  };

  return (
    <Dialog open={isReceivingCall} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        {isVideoCall ? 'Incoming Video Call' : 'Incoming Voice Call'}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Box sx={{ my: 2 }}>
          <Avatar
            name={caller?.displayName || 'Unknown'}
            src={caller?.avatarUrl}
            size={80}
          />
        </Box>
        <Typography variant="h6">{caller?.displayName || 'Unknown User'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {isVideoCall ? 'Video call' : 'Voice call'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={handleReject}
          color="error"
          variant="contained"
          sx={{ minWidth: 100 }}
        >
          Reject
        </Button>
        <Button
          onClick={handleAccept}
          color="success"
          variant="contained"
          sx={{ minWidth: 100 }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}
