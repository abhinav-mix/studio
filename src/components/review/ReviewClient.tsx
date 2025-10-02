
"use client";

import { useQuizStorage } from '@/hooks/useQuizStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { quizCategories } from '@/lib/questions';
import type { QuizAttempt } from '@/lib/types';
import { FileQuestion } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ReviewClient() {
  const { getAllAttemptsForCurrentUser, isClient } = useQuizStorage();
  const [allData, setAllData] = useState<{ category: string, attempts: QuizAttempt[] }[]>([]);

  useEffect(() => {
    if (isClient) {
      setAllData(getAllAttemptsForCurrentUser());
    }
  }, [isClient, getAllAttemptsForCurrentUser]);

  if (!isClient) {
    return <div className="container py-12 text-center">Loading Review...</div>;
  }
  
  const attemptedCategories = allData.filter(d => d.attempts.length > 0);
  const categoryDetails = quizCategories.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  }, {} as Record<string, typeof quizCategories[0]>);

  if (attemptedCategories.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline">No Attempts to Review!</h2>
        <p className="text-muted-foreground">Once you take a quiz, you can review your attempts here.</p>
        <Button asChild>
          <Link href="/home">Go to Quizzes</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Review Quiz Attempts</CardTitle>
          <CardDescription>Select a category to review your past attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {attemptedCategories.map(({ category, attempts }) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="p-4 text-xl font-headline bg-secondary/30 rounded-lg hover:no-underline">
                  {categoryDetails[category]?.name || category}
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {attempts.map((attempt, index) => (
                      <Card key={index} className="flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-lg">Attempt {attempts.length - index}</CardTitle>
                          <CardDescription>{new Date(attempt.date).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p>Score: <span className="font-bold">{attempt.score}/{attempt.totalQuestions}</span></p>
                        </CardContent>
                        <CardContent>
                          <Button asChild className="w-full" variant="outline">
                            <Link href={`/review/${category}/${index}`}>
                              View Details
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
