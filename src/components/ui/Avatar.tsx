'use client';

import { Avatar as MuiAvatar, AvatarProps, SxProps, Theme } from '@mui/material';
import { getInitials } from '@/lib/utils';

interface CustomAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  sx?: SxProps<Theme>;
}

export function Avatar({
  name,
  src,
  size = 40,
  showOnlineIndicator = false,
  isOnline = false,
  sx,
}: CustomAvatarProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <MuiAvatar
        src={src ?? undefined}
        alt={name}
        sx={{
          width: size,
          height: size,
          bgcolor: !src ? 'primary.main' : undefined,
          fontSize: size * 0.4,
          ...sx,
        }}
      >
        {getInitials(name)}
      </MuiAvatar>
      {showOnlineIndicator && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#4caf50' : '#9e9e9e',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
}
