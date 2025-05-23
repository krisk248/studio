
"use client";

import type { QuizData, QuizDetails, QuestionItem } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getLogContentsAction, saveQuizDataAction } from "@/actions/adminActions";
import { fetchAndParseCSV } from "@/lib/csvParser"; // For fetching initial data
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ShieldAlert, Eye, Edit3, Save, RefreshCcw, Loader2 } from "lucide-react";

const ADMIN_PASSWORD = "Vedant123*"; // As requested. WARNING: Not secure for production.

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: "Authenticated", description: "Welcome to the Admin Panel.",variant:"default" });
    } else {
      toast({ title: "Authentication Failed", description: "Incorrect password.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="items-center text-center">
            <ShieldAlert className="h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl">Admin Panel Access</CardTitle>
            <CardDescription>Please enter the password to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="py-6 text-lg"
            />
            <Button onClick={handleLogin} disabled={isLoading} className="w-full py-6 text-lg">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [logContent, setLogContent] = useState("Loading logs...");
  const [editableQuizData, setEditableQuizData] = useState<QuizData | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    const result = await getLogContentsAction();
    if (result.success) {
      setLogContent(result.content || "No logs available or file is empty.");
    } else {
      setLogContent(`Error fetching logs: ${result.message}`);
      toast({ title: "Log Error", description: result.message, variant: "destructive" });
    }
    setIsLoadingLogs(false);
  }, [toast]);

  const fetchQuiz = useCallback(async () => {
    setIsLoadingQuiz(true);
    const data = await fetchAndParseCSV(); // Uses the existing client-side capable fetcher
    if (data) {
      // Ensure choices always have 4 elements for the editor
      const questionsWithPaddedChoices = data.questions.map(q => ({
        ...q,
        choices: [
          q.choices[0] || "",
          q.choices[1] || "",
          q.choices[2] || "",
          q.choices[3] || "",
        ]
      }));
      setEditableQuizData({...data, questions: questionsWithPaddedChoices});
    } else {
      toast({ title: "Quiz Data Error", description: "Could not load quiz data for editing.", variant: "destructive" });
      // Initialize with a blank structure if loading fails, allowing creation
      setEditableQuizData({
        details: { date: "", time: "", title: "", numQuestions: 0, topics: "", version: "", level: "" },
        questions: []
      });
    }
    setIsLoadingQuiz(false);
  }, [toast]);

  useEffect(() => {
    fetchLogs();
    fetchQuiz();
  }, [fetchLogs, fetchQuiz]);

  const handleDetailChange = (field: keyof QuizDetails, value: string | number) => {
    setEditableQuizData(prev => {
      if (!prev) return null;
      const newDetails = { ...prev.details, [field]: value };
      return { ...prev, details: newDetails };
    });
  };

  const handleQuestionFieldChange = (qIndex: number, field: keyof Omit<QuestionItem, 'id' | 'choices'>, value: string) => {
    setEditableQuizData(prev => {
      if (!prev) return null;
      const newQuestions = prev.questions.map((q, i) => 
        i === qIndex ? { ...q, [field]: value } : q
      );
      return { ...prev, questions: newQuestions };
    });
  };

  const handleChoiceChange = (qIndex: number, cIndex: number, value: string) => {
    setEditableQuizData(prev => {
      if (!prev) return null;
      const newQuestions = [...prev.questions];
      const newChoices = [...newQuestions[qIndex].choices];
      newChoices[cIndex] = value;
      newQuestions[qIndex] = { ...newQuestions[qIndex], choices: newChoices };
      return { ...prev, questions: newQuestions };
    });
  };
  
  const addQuestion = () => {
    setEditableQuizData(prev => {
      if (!prev) return null;
      const newQuestion: QuestionItem = {
        id: prev.questions.length + 1, // This ID might not be persisted if not handled by save logic; CSV relies on row order
        question: "",
        choices: ["", "", "", ""],
        correctAnswer: "",
        explanation: ""
      };
      return { ...prev, questions: [...prev.questions, newQuestion] };
    });
  };

  const removeQuestion = (qIndex: number) => {
    setEditableQuizData(prev => {
      if (!prev) return null;
      const newQuestions = prev.questions.filter((_, i) => i !== qIndex);
      // Re-ID questions based on new order, though CSV is row-based
      const reIdQuestions = newQuestions.map((q, idx) => ({ ...q, id: idx + 1}));
      return { ...prev, questions: reIdQuestions };
    });
  };


  const handleSaveQuizData = async () => {
    if (!editableQuizData) {
      toast({ title: "Error", description: "No quiz data to save.", variant: "destructive" });
      return;
    }
    setIsSavingQuiz(true);
    const result = await saveQuizDataAction(editableQuizData);
    if (result.success) {
      toast({ title: "Quiz Data Saved", description: result.message });
      // Optionally re-fetch to confirm, or assume success
      await fetchQuiz(); // Refresh data from file after saving
    } else {
      toast({ title: "Save Error", description: result.message, variant: "destructive" });
    }
    setIsSavingQuiz(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center"><Eye className="mr-2 h-6 w-6 text-primary" />Quiz Attempt Logs</CardTitle>
            <CardDescription>View the recorded quiz attempts.</CardDescription>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="sm" disabled={isLoadingLogs}>
            {isLoadingLogs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh Logs
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logContent}
            readOnly
            rows={10}
            className="font-mono text-sm bg-muted/50"
            placeholder="Logs will appear here..."
          />
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center"><Edit3 className="mr-2 h-6 w-6 text-primary" />Edit Quiz Data (quiz-data.csv)</CardTitle>
            <CardDescription>Modify quiz details and questions. Remember to save your changes.</CardDescription>
          </div>
           <div className="space-x-2">
            <Button onClick={fetchQuiz} variant="outline" size="sm" disabled={isLoadingQuiz || isSavingQuiz}>
              {isLoadingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Reload Quiz
            </Button>
            <Button onClick={handleSaveQuizData} size="sm" disabled={isSavingQuiz || isLoadingQuiz || !editableQuizData}>
              {isSavingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Quiz Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingQuiz && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading quiz data...</p></div>}
          {!isLoadingQuiz && editableQuizData && (
            <>
              <Card>
                <CardHeader><CardTitle>Quiz Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(editableQuizData.details) as Array<keyof QuizDetails>).map(key => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={`detail-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <Input
                        id={`detail-${key}`}
                        type={key === 'numQuestions' ? 'number' : 'text'}
                        value={editableQuizData.details[key]}
                        onChange={(e) => handleDetailChange(key, key === 'numQuestions' ? parseInt(e.target.value) || 0 : e.target.value)}
                        disabled={key === 'numQuestions'} // numQuestions is derived from actual questions
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <CardTitle className="mt-6">Quiz Questions</CardTitle>
              {editableQuizData.questions.map((q, qIndex) => (
                <Card key={q.id || qIndex} className="p-4 space-y-3 relative">
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove
                    </Button>
                  <Label htmlFor={`q-${qIndex}-text`}>Question {qIndex + 1}</Label>
                  <Textarea
                    id={`q-${qIndex}-text`}
                    value={q.question}
                    onChange={(e) => handleQuestionFieldChange(qIndex, 'question', e.target.value)}
                    placeholder="Question text"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.choices.map((choice, cIndex) => (
                      <div key={cIndex} className="space-y-1">
                        <Label htmlFor={`q-${qIndex}-c-${cIndex}`}>Choice {cIndex + 1}</Label>
                        <Input
                          id={`q-${qIndex}-c-${cIndex}`}
                          value={choice}
                          onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                          placeholder={`Choice ${cIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`q-${qIndex}-correct`}>Correct Answer</Label>
                    <Input
                      id={`q-${qIndex}-correct`}
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionFieldChange(qIndex, 'correctAnswer', e.target.value)}
                      placeholder="Correct answer (exact match to one of the choices)"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`q-${qIndex}-explanation`}>Explanation</Label>
                    <Textarea
                      id={`q-${qIndex}-explanation`}
                      value={q.explanation}
                      onChange={(e) => handleQuestionFieldChange(qIndex, 'explanation', e.target.value)}
                      placeholder="Explanation for the answer"
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
              <Button onClick={addQuestion} variant="outline" className="mt-4">Add New Question</Button>
            </>
          )}
           {!isLoadingQuiz && !editableQuizData && (
            <p className="text-muted-foreground text-center p-8">Could not load quiz data. You might be able to create a new one by adding questions and saving.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center mt-8">
        Reminder: File saving operations (logs and quiz data) may be ephemeral or fail on certain hosting environments like Netlify due to read-only file systems. 
        Changes might not persist across deployments.
      </p>
    </div>
  );
}
