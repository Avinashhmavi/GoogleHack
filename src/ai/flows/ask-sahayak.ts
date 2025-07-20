'use server';

/**
 * @fileOverview An AI agent that provides kid-friendly explanations.
 * 
 * - askSahayak - A function that simplifies complex concepts for a specific grade level and language.
 * - AskSahayakInput - The input type for the askSahayak function.
 * - AskSahayakOutput - The return type for the askSahayak function.
 */

import { ai } from '@/ai/genkit';
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


export async function askSahayak(input: AskSahayakInput): Promise<AskSahayakOutput> {
  return askSahayakFlow(input);
}

const languageMap: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    hi: 'Hindi',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
}

const prompt = ai.definePrompt({
  name: 'askSahayakPrompt',
  input: { schema: AskSahayakInputSchema },
  output: { schema: AskSahayakOutputSchema },
  prompt: `You are 'Sahayak', a friendly and knowledgeable AI assistant for students.
Your goal is to explain concepts in a simple, engaging, and easy-to-understand way.

Explain the following concept to a student in grade {{gradeLevel}}.
The explanation must be in {{#findLanguage language}}{{this.name}}{{/findLanguage}}.

Use simple words, short sentences, and analogies or examples that a child at that grade level can relate to. Do not start with "Of course!" or "Certainly!". Just provide the explanation directly.

Question: {{{question}}}
`,
  
  // Custom Handlebars helper to map language code to language name
  template: {
      helpers: {
          findLanguage: (code: string) => languageMap[code] || 'English',
      }
  }
});

const askSahayakFlow = ai.defineFlow(
  {
    name: 'askSahayakFlow',
    inputSchema: AskSahayakInputSchema,
    outputSchema: AskSahayakOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
