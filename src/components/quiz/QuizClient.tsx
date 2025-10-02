
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

  useEffect(() => {
    setIsClient(true);
    // Shuffle only once on component mount
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
    const score = userAnswers.reduce((acc, userAnswer, index) => {
        const question = shuffledQuestions[index];
        if (question && question.id === userAnswer.questionId && question.correctAnswerIndex === userAnswer.selectedAnswerIndex) {
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
  
  const finalReviewStats = useMemo(() => {
    const answered = userAnswers.filter(a => a.selectedAnswerIndex !== null).length;
    const unanswered = userAnswers.length - answered;
    return { answered, unanswered };
  }, [userAnswers]);


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
              value={currentAnswer !== null && currentAnswer !== undefined ? currentAnswer.toString() : undefined}
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
              {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary">
                       <ClipboardCheck className="mr-2 h-4 w-4" />
                       Review Answers
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Review Your Answers</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to finish the quiz. Here is a summary of your attempt:
                        <ul className="list-disc pl-5 mt-4 space-y-1">
                           <li><span className="font-semibold">Total Questions:</span> {shuffledQuestions.length}</li>
                           <li><span className="font-semibold text-green-600">Answered:</span> {finalReviewStats.answered}</li>
                           <li><span className="font-semibold text-yellow-600">Unanswered:</span> {finalReviewStats.unanswered}</li>
                        </ul>
                        <p className="mt-4">Are you sure you want to submit?</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continue Reviewing</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFinishQuiz}>Submit Quiz</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {currentQuestionIndex === shuffledQuestions.length - 1 && (
                 <Button onClick={handleFinishQuiz} variant="default">
                   <Check className="mr-2 h-4 w-4" />
                   Finish Quiz
                 </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
