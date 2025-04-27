import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthInit() {
  const { checkUserSession } = useAuthStore();
  
  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);
  
  // This component doesn't render anything, it just initializes authentication
  return null;
} 