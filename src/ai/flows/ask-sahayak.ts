'use server';

/**
 * @fileOverview An AI agent that provides kid-friendly explanations.
 * 
 * - askSahayak - A function that simplifies complex concepts for a specific grade level and language.
 */

import { ai } from '@/ai/genkit';
import { 
    AskSahayakInputSchema, 
    AskSahayakOutputSchema,
    type AskSahayakInput,
    type AskSahayakOutput 
} from './ask-sahayak.types';


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
