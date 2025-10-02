export interface Question {
  id: string;
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
}

export interface QuizCategory {
  slug: string;
  name: string;
  description: string;
  imageId: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerIndex: number | null;
}

export interface QuizAttempt {
  date: number;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  category: string;
}

export interface PointEntry {
  id: string;
  pointsAdded: number;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  reason: string;
}
