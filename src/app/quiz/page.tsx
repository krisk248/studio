import { Suspense } from "react";
import { QuizClient } from "@/components/quiz/quiz-client";
import { NoQuizDisplay } from "@/components/quiz/no-quiz-display";
import { fetchAndParseCSV } from "@/lib/csvParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// This component ensures userName is extracted on the server if possible,
// or provides a fallback for QuizClient to use useSearchParams.
export default async function QuizPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const userName = typeof searchParams?.name === 'string' ? searchParams.name : "Quiz Taker";
  
  // Fetch quiz data here to decide if QuizClient should even render or show NoQuizDisplay
  const quizData = await fetchAndParseCSV();

  if (!quizData) {
    return <NoQuizDisplay />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-grow flex flex-col items-center">
        <Suspense fallback={<QuizLoadingSkeleton />}>
          <QuizClient userName={userName} initialQuizData={quizData} />
        </Suspense>
    </div>
  );
}

function QuizLoadingSkeleton() {
  return (
    <Card className="w-full max-w-3xl p-6 shadow-xl rounded-lg">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/4 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-12 w-1/3 mx-auto" />
      </CardContent>
    </Card>
  );
}
