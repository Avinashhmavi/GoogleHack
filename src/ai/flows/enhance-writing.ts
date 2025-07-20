'use server';
/**
 * @fileOverview An AI agent that enhances writing by checking grammar, spelling, and style.
 *
 * - enhanceWriting - A function that analyzes text and provides corrections and suggestions.
 */

import { ai } from '@/ai/genkit';
import {
  EnhanceWritingInputSchema,
  EnhanceWritingOutputSchema,
  type EnhanceWritingInput,
  type EnhanceWritingOutput
} from './enhance-writing.types';

export async function enhanceWriting(input: EnhanceWritingInput): Promise<EnhanceWritingOutput> {
  return enhanceWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceWritingPrompt',
  input: { schema: EnhanceWritingInputSchema },
  output: { schema: EnhanceWritingOutputSchema },
  prompt: `You are an expert writing assistant. Your goal is to help users improve their writing.
You will be given a piece of text.

First, correct all spelling and grammatical errors and provide the result in the 'correctedText' field.

Second, identify areas where the writing could be improved for clarity, style, or impact. For each of these, provide a suggestion in the 'suggestions' array. Each suggestion should include the original text snippet, your suggested improvement, and a brief explanation for the change.

Do not suggest changes for already correct grammar or spelling. Focus on stylistic improvements.

Original Text:
{{{text}}}
`,
});

const enhanceWritingFlow = ai.defineFlow(
  {
    name: 'enhanceWritingFlow',
    inputSchema: EnhanceWritingInputSchema,
    outputSchema: EnhanceWritingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
