'use server';

/**
 * @fileOverview Generates a multiple-choice quiz on a given topic.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  correctAnswer: z.number().describe('The index of the correct answer in the options array.'),
});

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('The title of the quiz.'),
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
  prompt: `You are an AI assistant for teachers. Generate a multiple-choice quiz with {{{numQuestions}}} questions about the following topic: {{{topic}}}.
Each question should have 4 options, and you must indicate the correct answer. The title of the quiz should be about the topic.`,
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
