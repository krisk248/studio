
"use server"

import type { QuizData } from "@/lib/types";
import fs from 'fs/promises';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'quiz_attempts.log');
const QUIZ_CSV_PATH = path.join(process.cwd(), 'public', 'quiz-data.csv');

export async function getLogContentsAction(): Promise<{ success: boolean; content?: string; message?: string }> {
  try {
    const logsDir = path.dirname(LOG_FILE_PATH);
    // Ensure logs directory exists - this might fail on read-only filesystems
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (mkdirError) {
      if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.warn('Admin: Could not create logs directory:', mkdirError);
      }
    }
    const content = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    return { success: true, content };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { success: true, content: "Log file does not exist yet or no attempts have been logged." };
    }
    console.error("Admin: Failed to read log file:", error);
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      return { success: false, message: "Failed to read log file: File system is read-only." };
    }
    return { success: false, message: "Failed to read log file due to a server error." };
  }
}

function quizDataToCsvString(data: QuizData): string {
  const detailsRow = [
    data.details.date,
    data.details.time,
    data.details.title,
    data.details.numQuestions.toString(),
    data.details.topics,
    data.details.version,
    data.details.level,
  ].join(',');

  const questionRows = data.questions.map(q => 
    [
      q.question,
      q.choices[0] || "",
      q.choices[1] || "",
      q.choices[2] || "",
      q.choices[3] || "",
      q.correctAnswer,
      q.explanation,
    ].join(',')
  );

  return [detailsRow, ...questionRows].join('\n');
}

export async function saveQuizDataAction(
  quizData: QuizData
): Promise<{ success: boolean; message?: string }> {
  try {
    // Recalculate numQuestions to ensure it's accurate
    const dataToSave = {
      ...quizData,
      details: {
        ...quizData.details,
        numQuestions: quizData.questions.length
      }
    };

    const csvString = quizDataToCsvString(dataToSave);
    await fs.writeFile(QUIZ_CSV_PATH, csvString, 'utf-8');
    return { success: true, message: "Quiz data saved successfully." };
  } catch (error) {
    console.error("Admin: Failed to save quiz data:", error);
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      return { success: false, message: "Failed to save quiz data: File system is read-only. Changes may not persist on this hosting environment." };
    }
    return { success: false, message: "Failed to save quiz data due to a server error." };
  }
}
