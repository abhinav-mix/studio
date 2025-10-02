"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizCategory, UserAnswer } from '@/lib/types';
import { useQuizStorage } from '@/hooks/useQuizStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Home, ClipboardCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import Image from 'next/image';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function QuizClient({ category, questions }: { category: QuizCategory; questions: Question[] }) {
  const router = useRouter();
  const { addAttempt } = useQuizStorage();
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [progressStats, setProgressStats] = useState({ correct: 0, incorrect: 0, unanswered: 0 });

  useEffect(() => {
    setIsClient(true);
    const questionsToShuffle = shuffleArray([...questions]);
    setShuffledQuestions(questionsToShuffle);
    setUserAnswers(questionsToShuffle.map(q => ({ questionId: q.id, selectedAnswerIndex: null })));
  }, [questions]);
  
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.questionId === questionId
          ? { ...answer, selectedAnswerIndex: answerIndex }
          : answer
      )
    );
  };

  const handleFinishQuiz = useCallback(() => {
    const score = userAnswers.reduce((acc, userAnswer) => {
      const question = shuffledQuestions.find(q => q.id === userAnswer.questionId);
      if (question && question.correctAnswerIndex === userAnswer.selectedAnswerIndex) {
        return acc + 1;
      }
      return acc;
    }, 0);

    addAttempt(category.slug, {
      score,
      totalQuestions: shuffledQuestions.length,
      answers: userAnswers,
      category: category.slug,
    });

    router.push(`/quiz/${category.slug}/results`);
  }, [userAnswers, shuffledQuestions, addAttempt, category.slug, router]);

  const calculateProgress = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    for (let i = 0; i <= currentQuestionIndex; i++) {
        const question = shuffledQuestions[i];
        const userAnswer = userAnswers.find(ua => ua.questionId === question.id);

        if (userAnswer?.selectedAnswerIndex !== null) {
            if (userAnswer.selectedAnswerIndex === question.correctAnswerIndex) {
                correct++;
            } else {
                incorrect++;
            }
        } else {
            unanswered++;
        }
    }
    setProgressStats({ correct, incorrect, unanswered });
  };


  const progress = useMemo(() => {
    if (shuffledQuestions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  }, [currentQuestionIndex, shuffledQuestions.length]);

  if (!isClient || shuffledQuestions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Loading quiz...</div>;
  }
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id)?.selectedAnswerIndex;

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 lg:p-12">
      <header className="mb-8 flex justify-between items-center">
        <Button variant="ghost" asChild>
          <Link href="/home">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline">{category.name} Quiz</h1>
        <div className="w-24"></div>
      </header>

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <div className="mb-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </p>
        </div>

        <Card className="w-full flex-1 flex flex-col animate-fade-in" key={currentQuestion.id}>
          <CardHeader>
            {currentQuestion.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <Image
                  src={currentQuestion.imageUrl}
                  alt="Question image"
                  width={400}
                  height={200}
                  className="w-full h-auto object-contain"
                  data-ai-hint="circuit diagram"
                />
              </div>
            )}
            <CardTitle className="text-xl md:text-2xl leading-relaxed">{currentQuestion.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <RadioGroup
              value={currentAnswer !== null ? currentAnswer?.toString() : undefined}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <Label
                  key={index}
                  htmlFor={`${currentQuestion.id}-${index}`}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-secondary has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`${currentQuestion.id}-${index}`} className="mr-4" />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between items-center flex-wrap gap-2">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestionIndex >= 19 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" onClick={calculateProgress}>
                       <ClipboardCheck className="mr-2 h-4 w-4" />
                       Check Progress
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Your Progress So Far</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have attempted {currentQuestionIndex + 1} questions. Here's your summary:
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                          <li className="text-green-600">Correct Answers: {progressStats.correct}</li>
                          <li className="text-red-600">Incorrect Answers: {progressStats.incorrect}</li>
                          {progressStats.unanswered > 0 && <li className="text-yellow-600">Unanswered: {progressStats.unanswered}</li>}
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
                      <Check className="mr-2 h-4 w-4" />
                      Finish Quiz
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you ready to finish?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to submit your answers. You cannot change them after this.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Review Answers</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFinishQuiz}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
