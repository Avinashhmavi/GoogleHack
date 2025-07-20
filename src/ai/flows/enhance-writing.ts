'use server';
/**
 * @fileOverview An AI agent that enhances writing by checking grammar, spelling, and style.
 *
 * - enhanceWriting - A function that analyzes text and provides corrections and suggestions.
 * - EnhanceWritingInput - The input type for the enhanceWriting function.
 * - EnhanceWritingOutput - The return type for the enhanceWriting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceWritingInputSchema = z.object({
  text: z.string().describe('The text to be analyzed and enhanced.'),
});
type EnhanceWritingInput = z.infer<typeof EnhanceWritingInputSchema>;

const SuggestionSchema = z.object({
    original: z.string().describe('The original phrase or sentence from the text.'),
    suggestion: z.string().describe('The suggested improvement.'),
    explanation: z.string().describe('An explanation of why the suggestion is better (e.g., "Improves clarity", "Corrects grammar").'),
});

const EnhanceWritingOutputSchema = z.object({
  correctedText: z.string().describe('The full text with all direct spelling and grammar errors corrected.'),
  suggestions: z.array(SuggestionSchema).describe('A list of suggestions for improving the style, clarity, or flow of the text.'),
});
type EnhanceWritingOutput = z.infer<typeof EnhanceWritingOutputSchema>;


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
