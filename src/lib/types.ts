
export interface QuizDetails {
  date: string;
  time: string;
  title: string;
  numQuestions: number;
  topics: string;
  version: string;
  level: string;
}

export interface QuestionItem {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  details: QuizDetails;
  questions: QuestionItem[];
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  attempts: number;
  explanation: string;
}

export interface QuizAttempt {
  userName: string;
  quizTitle: string;
  date: string;
  time: string;
  answers: UserAnswer[];
  score: number;
  totalQuestions: number;
}

export type FontSizeSetting = 'default' | 'large' | 'extra-large';
export type ThemeSetting = 'light' | 'dark' | 'system';
