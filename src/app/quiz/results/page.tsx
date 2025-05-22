"use client"; // Required for useSearchParams

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Home, RotateCcw } from "lucide-react";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const score = searchParams.get("score") || "0";
  const total = searchParams.get("total") || "0";
  const name = searchParams.get("name") || "Quiz Taker";

  // This page is a basic placeholder. 
  // The main QuizClient component now shows results inline upon quiz completion.
  // This page could be used if navigating with full results data was preferred.

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl rounded-lg">
        <CardHeader className="p-6">
          <Award className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Well done, {decodeURIComponent(name)}!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-2xl">
            Your Score: <span className="font-bold text-primary">{score}</span> / {total}
          </p>
          <p className="mt-4 text-muted-foreground">
            Your detailed results were shown on the previous screen and an attempt was made to log them.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6">
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Go Home
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href={`/quiz?name=${name}`}>
               <RotateCcw className="mr-2 h-5 w-5" /> Retake Quiz
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
