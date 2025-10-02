import Header from '@/components/Header';
import PointsClient from '@/components/points/PointsClient';

export default function PointsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <PointsClient />
      </main>
    </div>
  );
}
