'use server';

/**
 * @fileOverview Converts a photo of a textbook page into a worksheet with questions.
 *
 * - photoToWorksheet - A function that handles the photo to worksheet conversion process.
 * - PhotoToWorksheetInput - The input type for the photoToWorksheet function.
 * - PhotoToWorksheetOutput - The return type for the photoToWorksheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhotoToWorksheetInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PhotoToWorksheetInput = z.infer<typeof PhotoToWorksheetInputSchema>;

const PhotoToWorksheetOutputSchema = z.object({
  worksheet: z.string().describe('A formatted worksheet with questions based on the textbook page.'),
});
export type PhotoToWorksheetOutput = z.infer<typeof PhotoToWorksheetOutputSchema>;

export async function photoToWorksheet(input: PhotoToWorksheetInput): Promise<PhotoToWorksheetOutput> {
  return photoToWorksheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'photoToWorksheetPrompt',
  input: {schema: PhotoToWorksheetInputSchema},
  output: {schema: PhotoToWorksheetOutputSchema},
  prompt: `You are an expert educator specializing in creating learning exercises from textbook materials.

You will use the text extracted from the textbook page to generate relevant questions and a formatted worksheet.

Textbook Page:
{{media url=photoDataUri}}`,
});

const photoToWorksheetFlow = ai.defineFlow(
  {
    name: 'photoToWorksheetFlow',
    inputSchema: PhotoToWorksheetInputSchema,
    outputSchema: PhotoToWorksheetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
