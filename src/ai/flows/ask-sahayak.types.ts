/**
 * @fileOverview Type definitions for the ask-sahayak flow.
 */
import { z } from 'genkit';

export const AskSahayakInputSchema = z.object({
  question: z.string().describe('The question or concept to explain.'),
  gradeLevel: z.number().describe('The target grade level for the explanation.'),
  language: z.string().describe('The ISO 639-1 code for the language of the explanation.'),
});
export type AskSahayakInput = z.infer<typeof AskSahayakInputSchema>;

export const AskSahayakOutputSchema = z.object({
  answer: z.string().describe('The simplified, kid-friendly explanation.'),
});
export type AskSahayakOutput = z.infer<typeof AskSahayakOutputSchema>;
