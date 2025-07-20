
'use server';

/**
 * @fileOverview Generates a visual aid image from a text prompt.
 * 
 * - generateVisualAid - A function that creates an image based on a description.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateVisualAidInputSchema,
    GenerateVisualAidOutputSchema,
    type GenerateVisualAidInput,
    type GenerateVisualAidOutput
} from './generate-visual-aid.types';

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

    Visual: ${prompt}`;

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
