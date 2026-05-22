import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="text-6xl mb-4">🏆</div>
        <p className="font-heading text-accent-yellow text-2xl tracking-widest">BEHEMOTH</p>
        <p className="text-white/40 text-sm mt-2 font-body">Loading Platform of the Day...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}
