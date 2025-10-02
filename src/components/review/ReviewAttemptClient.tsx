
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizCategory, QuizAttempt } from '@/lib/types';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { allQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ReviewAttemptClient({ category, attemptIndex }: { category: QuizCategory, attemptIndex: number }) {
  const router = useRouter();
  const { getAttempts, isClient } = useQuizStorage();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (isClient) {
      const allAttempts = getAttempts(category.slug);
      const specificAttempt = allAttempts[attemptIndex];
      if (!specificAttempt) {
        // If no attempt is found, redirect to review page.
        router.replace('/review');
      } else {
        setAttempt(specificAttempt);
      }
    }
  }, [isClient, category.slug, attemptIndex, getAttempts, router]);

  if (!isClient || !attempt) {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  const { score, totalQuestions, answers, date } = attempt;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getQuestionById = (id: string) => allQuestions.find(q => q.id === id);
  
  const scoreColor = percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <header className="mb-8 flex justify-between items-center max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link href="/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Review
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline text-center">Review Details</h1>
        <Button variant="ghost" asChild>
          <Link href="/home">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </header>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Results for {category.name}</CardTitle>
            <CardDescription>Attempt from: {new Date(date).toLocaleString()}</CardDescription>
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
                   {question.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border">
                      <Image
                        src={question.imageUrl}
                        alt="Question image"
                        width={300}
                        height={150}
                        className="w-full h-auto object-contain"
                        data-ai-hint="circuit diagram"
                      />
                    </div>
                  )}
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
                   {userAnswer.selectedAnswerIndex === null && (
                     <p className="font-semibold text-yellow-600">You did not answer this question.</p>
                   )}
                  <Card className="bg-secondary p-4">
                     <p className="font-semibold">Explanation:</p>
                     <p className="text-muted-foreground">{question.explanation}</p>
                  </Card>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
