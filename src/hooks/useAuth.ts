'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();

  const redirectIfAuthenticated = () => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  };

  const redirectIfNotAuthenticated = () => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    redirectIfAuthenticated,
    redirectIfNotAuthenticated,
  };
}
