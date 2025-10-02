
import Header from '@/components/Header';
import ReviewClient from '@/components/review/ReviewClient';

export default function ReviewPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <ReviewClient />
      </main>
    </div>
  );
}
