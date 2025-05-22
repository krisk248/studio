import { fetchAndParseCSV } from "@/lib/csvParser"
import { NoQuizDisplay } from "@/components/quiz/no-quiz-display"
import { StartQuizForm } from "@/components/quiz/start-quiz-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default async function LandingPage() {
  const quizData = await fetchAndParseCSV()

  if (!quizData || !quizData.details) {
    return <NoQuizDisplay />
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader className="items-center text-center p-6">
          <FileText className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">{quizData.details.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground mt-2">
            Level: {quizData.details.level} | Topics: {quizData.details.topics} | Questions: {quizData.details.numQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <StartQuizForm />
        </CardContent>
      </Card>
    </div>
  )
}
