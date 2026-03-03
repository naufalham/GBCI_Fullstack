'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Profile } from '@/types';
import AboutSection from '@/components/profile/AboutSection';
import InterestSection from '@/components/profile/InterestSection';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      // If unauthorized (token expired/invalid), redirect to login
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        api.logout();
        router.replace('/login');
        return;
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    fetchProfile();
  }, [router, fetchProfile]);

  const handleLogout = () => {
    api.logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-youapp-dark flex items-center justify-center">
        <div className="animate-pulse text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-youapp-dark pb-8 relative overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()} className="text-white flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h1 className="text-white font-semibold">
          @{profile?.name || 'username'}
        </h1>
        <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm">
          Logout
        </button>
      </div>

      {/* Profile Banner */}
      <div className="mx-4 mb-6">
        <div className="relative h-48 rounded-2xl bg-youapp-card overflow-hidden">
          {profile?.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-youapp-card to-youapp-darker" />
          )}
          <div className="absolute bottom-4 left-4">
            <h2 className="text-white font-bold text-lg">
              @{profile?.name || 'username'}
              {profile?.birthday && (
                <span className="font-normal text-sm ml-2">
                  , {calculateAge(profile.birthday)}
                </span>
              )}
            </h2>
            {profile?.gender && (
              <p className="text-white/60 text-sm">{profile.gender}</p>
            )}
            {profile?.horoscope && (
              <div className="flex gap-2 mt-2">
                <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                  {profile.horoscope}
                </span>
                <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                  {profile.zodiac}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 space-y-4">
        <AboutSection profile={profile} onUpdate={fetchProfile} />
        <InterestSection
          interests={profile?.interests || []}
          onUpdate={fetchProfile}
        />
      </div>
    </div>
  );
}

function calculateAge(dateStr: string): number {
  const today = new Date();
  const birthDate = new Date(dateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
