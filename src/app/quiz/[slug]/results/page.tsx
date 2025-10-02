import { quizCategories } from '@/lib/questions';
import ResultsClient from '@/components/quiz/ResultsClient';
import { notFound } from 'next/navigation';

export default function ResultsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = quizCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return <ResultsClient category={category} />;
}
