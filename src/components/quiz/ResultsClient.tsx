"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizCategory, QuizAttempt, Question } from '@/lib/types';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { allQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResultsClient({ category }: { category: QuizCategory }) {
  const router = useRouter();
  const { getLatestAttempt, isClient } = useQuizStorage();
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (isClient) {
      const attempt = getLatestAttempt(category.slug);
      if (!attempt) {
        // If no attempt is found, maybe they refreshed. Redirect to quiz start.
        router.replace(`/quiz/${category.slug}`);
      } else {
        setLatestAttempt(attempt);
      }
    }
  }, [isClient, category.slug, getLatestAttempt, router]);

  if (!latestAttempt) {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  const { score, totalQuestions, answers } = latestAttempt;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getQuestionById = (id: string) => allQuestions.find(q => q.id === id);
  
  const scoreColor = percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Quiz Results for {category.name}</CardTitle>
            <CardDescription>Here's how you performed.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-6xl font-bold">
              <span className={scoreColor}>{score}</span> / {totalQuestions}
            </p>
            <p className={`text-3xl font-semibold mt-2 ${scoreColor}`}>
              ({percentage}%)
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-center mb-6">Detailed Feedback</h2>
          {answers.map((userAnswer, index) => {
            const question = getQuestionById(userAnswer.questionId);
            if (!question) return null;

            const isCorrect = question.correctAnswerIndex === userAnswer.selectedAnswerIndex;
            
            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-start gap-4">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 mt-1 shrink-0" />
                    )}
                    <span>{index + 1}. {question.questionText}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pl-16">
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = userAnswer.selectedAnswerIndex === optionIndex;
                      const isCorrectAnswer = question.correctAnswerIndex === optionIndex;
                      let stateClass = '';
                      if (isCorrectAnswer) stateClass = 'bg-green-100 dark:bg-green-900/30 border-green-500';
                      if (isUserAnswer && !isCorrect) stateClass = 'bg-red-100 dark:bg-red-900/30 border-red-500';

                      return (
                        <div key={optionIndex} className={`p-3 rounded-md border ${stateClass}`}>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  <Card className="bg-secondary p-4">
                     <p className="font-semibold">Explanation:</p>
                     <p className="text-muted-foreground">{question.explanation}</p>
                  </Card>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="default" asChild>
                <Link href={`/quiz/${category.slug}`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/home">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
