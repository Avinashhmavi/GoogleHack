'use server';

/**
 * @fileOverview Generates a visual aid image from a text prompt.
 * 
 * - generateVisualAid - A function that creates an image based on a description.
 * - GenerateVisualAidInput - The input type for the generateVisualAid function.
 * - GenerateVisualAidOutput - The return type for the generateVisualAid function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateVisualAidInputSchema = z.object({
  prompt: z.string().describe('A text description of the visual aid to generate.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

export const GenerateVisualAidOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated image as a data URI. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async ({ prompt }) => {
    const fullPrompt = `Generate a simple, educational, blackboard-style line drawing with a clean, white background. The image should be clear and easy to understand for a classroom setting.

    Visual a: ${prompt}`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: fullPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to produce an output.');
    }

    return {
      imageDataUri: media.url,
    };
  }
);
