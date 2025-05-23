
import type { QuizData, QuizDetails, QuestionItem } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

export async function fetchAndParseCSV(filePath: string = '/quiz-data.csv'): Promise<QuizData | null> {
  let csvText: string;

  try {
    if (typeof window === 'undefined') {
      // Server-side: read from the filesystem
      const fileName = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const absolutePath = path.join(process.cwd(), 'public', fileName);
      
      try {
        csvText = await fs.readFile(absolutePath, 'utf-8');
      } catch (fsError) {
        if ((fsError as NodeJS.ErrnoException).code === 'ENOENT') {
          console.warn(`Server-side: CSV file not found at ${absolutePath}. Ensure '${fileName}' is in the 'public' directory.`);
        } else {
          console.error(`Server-side: Error reading CSV file '${fileName}' at ${absolutePath}:`, fsError);
        }
        return null;
      }
    } else {
      // Client-side: fetch over HTTP
      const response = await fetch(filePath);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Client-side: CSV file not found at ${filePath}. Ensure it's served from the 'public' directory.`);
          return null;
        }
        console.error(`Client-side: Failed to fetch CSV '${filePath}': ${response.status} ${response.statusText}`);
        return null;
      }
      csvText = await response.text();
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      console.warn(`CSV file '${filePath}' is empty or has only a header row. At least one data row is required.`);
      return null;
    }

    const detailValues = lines[0].split(',').map(s => s.trim());
    if (detailValues.length < 7) {
      console.warn(`CSV file '${filePath}' has an invalid details row (requires at least 7 columns). Header: "${lines[0]}"`);
      return null;
    }
    const details: QuizDetails = {
      date: detailValues[0],
      time: detailValues[1],
      title: detailValues[2],
      numQuestions: parseInt(detailValues[3], 10) || 0,
      topics: detailValues[4],
      version: detailValues[5],
      level: detailValues[6],
    };

    const questions: QuestionItem[] = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(s => s.trim());
      if (values.length < 7) {
        console.warn(`Skipping invalid question row ${index + 2} in '${filePath}' (requires at least 7 columns): "${line}"`);
        return null; 
      }
      return {
        id: index + 1,
        question: values[0],
        // Ensure choices array always has 4 elements, potentially empty strings
        choices: [values[1] || "", values[2] || "", values[3] || "", values[4] || ""],
        correctAnswer: values[5],
        explanation: values[6],
      };
    }).filter(q => q !== null) as QuestionItem[];

    if (questions.length === 0) {
      console.warn(`No valid questions found in CSV '${filePath}'.`);
      return null;
    }
    
    if (details.numQuestions !== questions.length) {
        console.warn(`Mismatch in number of questions for '${filePath}'. Header: ${details.numQuestions}, Parsed: ${questions.length}. Using parsed count.`);
        details.numQuestions = questions.length;
    }

    return { details, questions };
  } catch (error) {
    console.error(`Unexpected error while processing CSV file '${filePath}':`, error);
    return null;
  }
}
