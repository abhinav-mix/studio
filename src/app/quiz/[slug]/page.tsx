import QuizClient from '@/components/quiz/QuizClient';
import { allQuestions, quizCategories } from '@/lib/questions';
import type { Question } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function QuizPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = quizCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const questionsForCategory: Question[] = allQuestions.filter(
    (q) => q.category === slug
  );

  return <QuizClient category={category} questions={questionsForCategory} />;
}
