/**
 * @fileOverview Type definitions for the enhance-writing flow.
 */
import type { z } from 'genkit';

const SuggestionSchema = z.object({
    original: z.string().describe('The original phrase or sentence from the text.'),
    suggestion: z.string().describe('The suggested improvement.'),
    explanation: z.string().describe('An explanation of why the suggestion is better (e.g., "Improves clarity", "Corrects grammar").'),
});

export const EnhanceWritingInputSchema = z.object({
  text: z.string().describe('The text to be analyzed and enhanced.'),
});
export type EnhanceWritingInput = z.infer<typeof EnhanceWritingInputSchema>;

export const EnhanceWritingOutputSchema = z.object({
  correctedText: z.string().describe('The full text with all direct spelling and grammar errors corrected.'),
  suggestions: z.array(SuggestionSchema).describe('A list of suggestions for improving the style, clarity, or flow of the text.'),
});
export type EnhanceWritingOutput = z.infer<typeof EnhanceWritingOutputSchema>;
