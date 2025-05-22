"use server"

import type { QuizAttempt } from "@/lib/types";
import fs from 'fs/promises';
import path from 'path';

export async function logQuizAttemptAction(
  attemptData: QuizAttempt
): Promise<{ success: boolean; message?: string }> {
  const { userName, quizTitle, date, time, answers, score, totalQuestions } = attemptData;

  let logEntry = `----------------------------------------\n`;
  logEntry += `User: ${userName}\n`;
  logEntry += `Quiz Title: ${quizTitle}\n`;
  logEntry += `Date: ${date} ${time}\n`;
  logEntry += `Score: ${score} / ${totalQuestions}\n`;
  logEntry += `Responses:\n`;
  answers.forEach(ans => {
    logEntry += `  Q${ans.questionId}: "${ans.questionText}"\n`;
    logEntry += `    Selected: "${ans.selectedAnswer}" (Attempts: ${ans.attempts}, Correct: ${ans.isCorrect})\n`;
    logEntry += `    Correct Answer: "${ans.correctAnswer}"\n`;
    logEntry += `    Explanation: "${ans.explanation}"\n`;
  });
  logEntry += `----------------------------------------\n\n`;

  try {
    // Ensure logs directory exists - this might fail on read-only filesystems
    // For Netlify, this file write will likely be ephemeral or fail.
    // A more robust solution would involve a database or a dedicated logging service.
    const logsDir = path.join(process.cwd(), 'logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (mkdirError) {
      // Ignore if directory already exists, but log other errors
      if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.warn('Could not create logs directory:', mkdirError);
      }
    }
    
    const logFilePath = path.join(logsDir, 'quiz_attempts.log');
    await fs.appendFile(logFilePath, logEntry);
    return { success: true, message: "Quiz attempt logged successfully." };
  } catch (error) {
    console.error("Failed to log quiz attempt:", error);
    // Return specific error if it's a file system error like read-only
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
         return { success: false, message: "Failed to log quiz attempt: File system is read-only." };
    }
    return { success: false, message: "Failed to log quiz attempt due to a server error." };
  }
}
