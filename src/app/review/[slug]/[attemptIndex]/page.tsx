
import { quizCategories } from '@/lib/questions';
import ReviewAttemptClient from '@/components/review/ReviewAttemptClient';
import { notFound } from 'next/navigation';

export default function ReviewAttemptPage({ params }: { params: { slug: string, attemptIndex: string } }) {
  const { slug, attemptIndex } = params;
  const category = quizCategories.find((c) => c.slug === slug);
  const attemptIdx = parseInt(attemptIndex, 10);

  if (!category || isNaN(attemptIdx)) {
    notFound();
  }

  return <ReviewAttemptClient category={category} attemptIndex={attemptIdx} />;
}
