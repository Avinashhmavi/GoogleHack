'use server';
/**
 * @fileOverview An AI agent that adapts content to a specific grade level.
 *
 * - adaptContentGradeLevel - A function that adapts content to a specific grade level.
 * - AdaptContentGradeLevelInput - The input type for the adaptContentGradeLevel function.
 * - AdaptContentGradeLevelOutput - The return type for the adaptContentGradeLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptContentGradeLevelInputSchema = z.object({
  content: z.string().describe('The content to adapt.'),
  gradeLevel: z.number().describe('The target grade level for the content.'),
});
export type AdaptContentGradeLevelInput = z.infer<typeof AdaptContentGradeLevelInputSchema>;

const AdaptContentGradeLevelOutputSchema = z.object({
  adaptedContent: z.string().describe('The adapted content for the specified grade level.'),
});
export type AdaptContentGradeLevelOutput = z.infer<typeof AdaptContentGradeLevelOutputSchema>;

export async function adaptContentGradeLevel(input: AdaptContentGradeLevelInput): Promise<AdaptContentGradeLevelOutput> {
  return adaptContentGradeLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptContentGradeLevelPrompt',
  input: {schema: AdaptContentGradeLevelInputSchema},
  output: {schema: AdaptContentGradeLevelOutputSchema},
  prompt: `You are an expert educator specializing in adapting content for different grade levels.

You will receive content and a target grade level. You will adapt the content to be appropriate for the specified grade level, ensuring that the complexity and challenge are suitable for learners at that level.

Content: {{{content}}}
Grade Level: {{{gradeLevel}}}

Adapted Content:`,
});

const adaptContentGradeLevelFlow = ai.defineFlow(
  {
    name: 'adaptContentGradeLevelFlow',
    inputSchema: AdaptContentGradeLevelInputSchema,
    outputSchema: AdaptContentGradeLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
