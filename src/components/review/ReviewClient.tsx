
"use client";

import { useQuizStorage } from '@/hooks/useQuizStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { quizCategories } from '@/lib/questions';
import type { QuizAttempt } from '@/lib/types';
import { FileQuestion, TrendingUp, TrendingDown, BarChart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CategoryStats {
  averageScore: number;
  highestScore: number;
  totalAttempts: number;
  totalPossibleScore: number;
}

export default function ReviewClient() {
  const { getAllAttemptsForCurrentUser, isClient } = useQuizStorage();
  const [allData, setAllData] = useState<{ category: string, attempts: QuizAttempt[] }[]>([]);

  useEffect(() => {
    if (isClient) {
      setAllData(getAllAttemptsForCurrentUser());
    }
  }, [isClient, getAllAttemptsForCurrentUser]);

  const categoryDetails = useMemo(() => {
    return quizCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat;
      return acc;
    }, {} as Record<string, typeof quizCategories[0]>);
  }, []);
  
  const analyzedData = useMemo(() => {
    return allData
      .map(({ category, attempts }) => {
        if (attempts.length === 0) return null;

        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const totalPossibleScore = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
        const averageScore = totalScore / attempts.length;
        const highestScore = Math.max(...attempts.map(a => a.score));
        const averagePercentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
        
        return {
          category,
          attempts,
          stats: {
            averageScore,
            highestScore,
            totalAttempts: attempts.length,
            averagePercentage: Math.round(averagePercentage),
            totalQuestions: attempts[0]?.totalQuestions || 0
          }
        };
      })
      .filter(Boolean) as { category: string; attempts: QuizAttempt[]; stats: any }[];
  }, [allData]);


  if (!isClient) {
    return <div className="container py-12 text-center">Loading Review...</div>;
  }
  
  if (analyzedData.length === 0) {
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
          <CardDescription>Select a category to review your past attempts and analyze your performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
            {analyzedData.map(({ category, attempts, stats }) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="p-4 text-xl font-headline bg-secondary/30 rounded-lg hover:no-underline">
                   <div className="flex justify-between items-center w-full">
                      <span>{categoryDetails[category]?.name || category}</span>
                      <span className="text-lg font-sans font-semibold text-primary mr-4">{stats.averagePercentage}% Avg</span>
                   </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <Card className="p-4">
                         <CardHeader className="p-2">
                           <CardTitle className="text-base font-semibold text-muted-foreground">Total Attempts</CardTitle>
                         </CardHeader>
                         <CardContent className="p-2">
                           <p className="text-3xl font-bold">{stats.totalAttempts}</p>
                         </CardContent>
                      </Card>
                      <Card className="p-4">
                         <CardHeader className="p-2">
                           <CardTitle className="text-base font-semibold text-muted-foreground">Average Score</CardTitle>
                         </CardHeader>
                         <CardContent className="p-2">
                           <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)} / {stats.totalQuestions}</p>
                         </CardContent>
                      </Card>
                      <Card className="p-4">
                         <CardHeader className="p-2">
                           <CardTitle className="text-base font-semibold text-muted-foreground">Highest Score</CardTitle>
                         </CardHeader>
                         <CardContent className="p-2">
                           <p className="text-3xl font-bold">{stats.highestScore} / {stats.totalQuestions}</p>
                         </CardContent>
                      </Card>
                  </div>

                  <h4 className="font-bold mb-4 text-lg">All Attempts:</h4>
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
