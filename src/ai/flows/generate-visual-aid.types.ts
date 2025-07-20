
/**
 * @fileOverview Type definitions for the generate-visual-aid flow.
 */
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
