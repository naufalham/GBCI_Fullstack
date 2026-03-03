'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (api.isAuthenticated()) {
      router.replace('/profile');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-youapp-dark flex items-center justify-center">
      <div className="animate-pulse text-white text-lg">Loading...</div>
    </div>
  );
}
