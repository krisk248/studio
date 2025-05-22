import type { QuizData, QuizDetails, QuestionItem } from '@/lib/types';

export async function fetchAndParseCSV(filePath: string = '/quiz-data.csv'): Promise<QuizData | null> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`CSV file not found at ${filePath}`);
        return null;
      }
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      console.warn('CSV file is empty or has no questions.');
      return null;
    }

    // Parse details from the first row
    const detailValues = lines[0].split(',').map(s => s.trim());
    if (detailValues.length < 7) {
      console.warn('CSV file has an invalid details row.');
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

    // Parse questions from subsequent rows
    const questions: QuestionItem[] = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(s => s.trim());
      if (values.length < 7) {
        console.warn(`Skipping invalid question row ${index + 2}: ${line}`);
        return null; // Skip malformed rows
      }
      return {
        id: index + 1,
        question: values[0],
        choices: [values[1], values[2], values[3], values[4]].filter(Boolean), // Filter out empty choices
        correctAnswer: values[5],
        explanation: values[6],
      };
    }).filter(q => q !== null) as QuestionItem[];

    if (questions.length === 0) {
      console.warn('No valid questions found in CSV.');
      return null;
    }
    
    // Adjust numQuestions in details if it differs from actual parsed questions
    if (details.numQuestions !== questions.length) {
        console.warn(`Mismatch in number of questions. Header: ${details.numQuestions}, Actual: ${questions.length}. Using actual count.`);
        details.numQuestions = questions.length;
    }


    return { details, questions };
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    return null;
  }
}
