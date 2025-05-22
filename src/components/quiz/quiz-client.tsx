"use client"

import type { QuizData, QuestionItem, UserAnswer } from "@/lib/types"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Home } from "lucide-react"
import { logQuizAttemptAction } from "@/actions/logQuizAttempt"
import { useToast } from "@/hooks/use-toast"
import { NoQuizDisplay } from "./no-quiz-display"

interface QuizClientProps {
  userName: string;
  initialQuizData: QuizData | null;
}

export function QuizClient({ userName: initialUserName, initialQuizData }: QuizClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userName, setUserName] = useState(initialUserName);
  const [quizData, setQuizData] = useState<QuizData | null>(initialQuizData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'info', message: string, explanation?: string } | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // If userName wasn't available server-side (e.g. static export), try getting from URL.
  useEffect(() => {
    if (!initialUserName || initialUserName === "Quiz Taker") {
      const nameFromUrl = searchParams.get("name");
      if (nameFromUrl) {
        setUserName(nameFromUrl);
      }
    }
  }, [searchParams, initialUserName]);

  if (!quizData) {
    return <NoQuizDisplay />;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  const handleChoiceSelection = (choice: string) => {
    if (feedback) return; // Don't allow changing choice after feedback is shown for current attempt
    setSelectedChoice(choice);
    setIsAnswerSelected(true);
  };

  const handleSubmitAnswer = () => {
    if (!selectedChoice) return;

    const isCorrect = selectedChoice === currentQuestion.correctAnswer;
    setCurrentAttempts(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ 
        type: 'correct', 
        message: "Correct!", 
        explanation: currentQuestion.explanation 
      });
      const answerLog: UserAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedAnswer: selectedChoice,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: true,
        attempts: currentAttempts + 1,
        explanation: currentQuestion.explanation,
      };
      setUserAnswers(prev => [...prev, answerLog]);
    } else {
      if (currentAttempts + 1 >= 2) {
        setFeedback({ 
          type: 'incorrect', 
          message: "Incorrect. The correct answer is highlighted.", 
          explanation: currentQuestion.explanation 
        });
        const answerLog: UserAnswer = {
          questionId: currentQuestion.id,
          questionText: currentQuestion.question,
          selectedAnswer: selectedChoice,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: false,
          attempts: currentAttempts + 1,
          explanation: currentQuestion.explanation,
        };
        setUserAnswers(prev => [...prev, answerLog]);
      } else {
        setFeedback({ 
          type: 'info', 
          message: "Not quite. Try again!",
        });
        // Don't log answer yet, allow second attempt
      }
    }
    setIsAnswerSelected(false); // Reset for next potential action (next question or submit again)
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      finishQuiz();
    }
  };
  
  const resetQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswerSelected(false);
    setFeedback(null);
    setCurrentAttempts(0);
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const attemptData = {
      userName,
      quizTitle: quizData.details.title,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      answers: userAnswers,
      score,
      totalQuestions,
    };
    
    try {
      const result = await logQuizAttemptAction(attemptData);
      if (result.success) {
        toast({ title: "Quiz Logged", description: "Your results have been recorded." });
      } else {
        toast({ title: "Logging Error", description: result.message || "Could not record results.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Logging Error", description: "An unexpected error occurred while recording results.", variant: "destructive" });
    }
    
    // Navigate to results page (or show inline)
    // For now, showing inline:
  };

  if (quizFinished) {
    return (
      <Card className="w-full max-w-2xl p-6 md:p-8 shadow-xl rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Quiz Completed, {userName}!</CardTitle>
          <CardDescription className="text-lg md:text-xl mt-2">
            You scored {score} out of {totalQuestions}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userAnswers.map((ans, idx) => (
            <div key={idx} className="p-3 border rounded-md text-left">
              <p className="font-semibold">Q{ans.questionId}: {ans.questionText}</p>
              <p>Your answer: <span className={ans.isCorrect ? 'text-accent' : 'text-destructive'}>{ans.selectedAnswer}</span> ({ans.attempts} {ans.attempts === 1 ? 'try' : 'tries'})</p>
              {!ans.isCorrect && <p>Correct answer: {ans.correctAnswer}</p>}
              <p className="text-sm text-muted-foreground mt-1">Explanation: {ans.explanation}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Button onClick={() => router.push('/')} variant="outline" size="lg">
            <Home className="mr-2 h-5 w-5" /> Go Home
          </Button>
          <Button onClick={() => {
             setCurrentQuestionIndex(0);
             setUserAnswers([]);
             setScore(0);
             setQuizFinished(false);
             resetQuestionState();
          }} size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-3xl p-4 md:p-8 shadow-xl rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl mb-1">{quizData.details.title}</CardTitle>
        <CardDescription className="text-md md:text-lg">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardDescription>
        <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="mt-4 w-full" />
      </CardHeader>

      <CardContent className="space-y-6 mt-6">
        <h2 className="text-xl md:text-2xl font-semibold text-center">{currentQuestion.question}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {currentQuestion.choices.map((choice, idx) => (
            <Button
              key={idx}
              variant={selectedChoice === choice ? "default" : "outline"}
              size="lg"
              className={`p-4 h-auto text-base md:text-lg whitespace-normal text-left justify-start break-words
                ${feedback && choice === currentQuestion.correctAnswer ? 'bg-accent/80 hover:bg-accent text-accent-foreground' : ''}
                ${feedback && selectedChoice === choice && choice !== currentQuestion.correctAnswer ? 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' : ''}
              `}
              onClick={() => handleChoiceSelection(choice)}
              disabled={!!feedback && (feedback.type === 'correct' || feedback.type === 'incorrect' || (feedback.type === 'info' && selectedChoice !== null))}
            >
              {choice}
            </Button>
          ))}
        </div>

        {feedback && (
          <Alert variant={feedback.type === 'correct' ? 'default' : feedback.type === 'incorrect' ? 'destructive' : 'default'} className={`${feedback.type === 'correct' ? 'border-accent' : ''}`}>
            {feedback.type === 'correct' && <CheckCircle2 className="h-5 w-5 text-accent" />}
            {feedback.type === 'incorrect' && <XCircle className="h-5 w-5 text-destructive" />}
            {feedback.type === 'info' && <HelpCircle className="h-5 w-5" />}
            <AlertTitle className="ml-2 text-lg">{feedback.message}</AlertTitle>
            {feedback.explanation && <AlertDescription className="ml-2 mt-1">{feedback.explanation}</AlertDescription>}
          </Alert>
        )}
      </CardContent>

      <CardFooter className="mt-8 flex justify-center">
        {(!feedback || feedback.type === 'info') && currentAttempts < 2 && (
          <Button onClick={handleSubmitAnswer} disabled={!isAnswerSelected || !!(feedback && feedback.type === 'info' && selectedChoice === null) } size="lg" className="px-8 md:px-12 py-3 md:py-4 text-lg">
            Submit Answer {currentAttempts > 0 ? `(Attempt ${currentAttempts + 1})` : ''}
          </Button>
        )}
        {(feedback && (feedback.type === 'correct' || feedback.type === 'incorrect' || currentAttempts >=2 )) && (
          <Button onClick={handleNext} size="lg" className="px-8 md:px-12 py-3 md:py-4 text-lg">
            {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
