"use client";

import { useQuizStorage } from '@/hooks/useQuizStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { quizCategories } from '@/lib/questions';
import type { QuizAttempt } from '@/lib/types';
import { Smile } from 'lucide-react';

export default function ProgressClient() {
  const { getAllAttempts, isClient } = useQuizStorage();
  const [allData, setAllData] = useState<{ category: string, attempts: QuizAttempt[] }[]>([]);

  useEffect(() => {
    if (isClient) {
      setAllData(getAllAttempts());
    }
  }, [isClient, getAllAttempts]);

  if (!isClient) {
    return <div className="container py-12 text-center">Loading Progress...</div>;
  }
  
  const attemptedCategories = allData.filter(d => d.attempts.length > 0);
  const categoryDetails = quizCategories.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  }, {} as Record<string, typeof quizCategories[0]>);

  if (attemptedCategories.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Smile className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline">No attempts yet!</h2>
        <p className="text-muted-foreground">Start a quiz to see your progress here.</p>
        <Button asChild>
          <Link href="/home">Go to Quizzes</Link>
        </Button>
      </div>
    );
  }
  
  const defaultTab = attemptedCategories[0]?.category || '';

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-headline">My Progress</h1>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {attemptedCategories.map(({ category }) => (
            <TabsTrigger key={category} value={category}>{categoryDetails[category]?.name || category}</TabsTrigger>
          ))}
        </TabsList>
        {attemptedCategories.map(({ category, attempts }) => (
          <TabsContent key={category} value={category}>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-headline">{categoryDetails[category]?.name || category} Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attempts.slice().reverse()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                      <YAxis allowDecimals={false} domain={[0, attempts[0]?.totalQuestions || 20]}/>
                      <Tooltip 
                        contentStyle={{
                          background: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))"
                        }}
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                        formatter={(value, name, props) => [`${value} / ${props.payload.totalQuestions}`, 'Score']}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8">
                  <h3 className="font-bold mb-4">Recent Attempts:</h3>
                  <ul className="space-y-2">
                    {attempts.map((attempt, index) => (
                      <li key={index} className="flex justify-between items-center p-2 rounded-md bg-secondary">
                        <span>{new Date(attempt.date).toLocaleString()}</span>
                        <span className="font-bold">{attempt.score}/{attempt.totalQuestions}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
