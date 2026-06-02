import dynamic from 'next/dynamic';

const AuthGate = dynamic(() => import('@/components/AuthGate'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="text-6xl mb-4">🎢</div>
        <p className="font-heading text-[#B08C1E] text-2xl tracking-widest">BEHEMOTH</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AuthGate />;
}
