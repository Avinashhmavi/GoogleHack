/**
 * @fileOverview Type definitions for the recognize-students flow.
 */
import { z } from 'genkit';

export const RecognizeStudentsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the classroom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeStudentsInput = z.infer<typeof RecognizeStudentsInputSchema>;

export const RecognizeStudentsOutputSchema = z.object({
  presentStudents: z.array(z.string()).describe('A list of names of the students identified in the photo.'),
});
export type RecognizeStudentsOutput = z.infer<typeof RecognizeStudentsOutputSchema>;
