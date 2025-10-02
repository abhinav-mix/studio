import Header from '@/components/Header';
import ProgressClient from '@/components/progress/ProgressClient';

export default function ProgressPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <ProgressClient />
      </main>
    </div>
  );
}
