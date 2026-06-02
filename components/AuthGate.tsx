'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PINScreen from './PINScreen';

const Dashboard = dynamic(() => import('./Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="text-6xl mb-4">🎢</div>
        <p className="font-heading text-[#B08C1E] text-2xl tracking-widest">BEHEMOTH</p>
        <p className="text-[#3A3A3A] text-sm mt-2 font-body">Loading Platform of the Day...</p>
      </div>
    </div>
  ),
});

type Role = 'admin' | 'crew';

export default function AuthGate() {
  const [role, setRole] = useState<Role | null | 'loading'>('loading');

  useEffect(() => {
    const stored = sessionStorage.getItem('behemoth-role');
    if (stored === 'admin' || stored === 'crew') {
      setRole(stored);
    } else {
      setRole(null);
    }
  }, []);

  function handleSuccess(r: Role) {
    sessionStorage.setItem('behemoth-role', r);
    setRole(r);
  }

  // One tick to prevent sessionStorage flash
  if (role === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#0A0A0A]" />
    );
  }

  if (role === null) {
    return <PINScreen onSuccess={handleSuccess} />;
  }

  return <Dashboard isAdmin={role === 'admin'} />;
}
