'use server';

/**
 * @fileOverview Generates a quiz on a given topic with various question types.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).optional().describe('An array of possible answers for multiple-choice questions.'),
  answer: z.string().describe('The correct answer. For multiple-choice, it should be the text of the correct option. For true/false, it should be "True" or "False". For short-answer, it is the expected answer.'),
});

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate.'),
  quizType: z.enum(['multiple-choice', 'short-answer', 'true-false']).describe('The type of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('The title of the quiz.'),
  quizType: z.enum(['multiple-choice', 'short-answer', 'true-false']).describe('The type of questions in the quiz.'),
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an AI assistant for teachers. Generate a {{{quizType}}} quiz with {{{numQuestions}}} questions about the following topic: {{{topic}}}.

- For 'multiple-choice' questions, provide 4 options and identify the correct answer text.
- For 'true-false' questions, the answer should be 'True' or 'False'.
- For 'short-answer' questions, the answer should be a concise correct response.

The title of the quiz should be about the topic.
The 'quizType' field in the output must match the requested quiz type.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
