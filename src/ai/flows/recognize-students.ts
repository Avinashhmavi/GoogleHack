'use server';

/**
 * @fileOverview An AI agent that recognizes students from a class photo.
 *
 * - recognizeStudents - A function that identifies students in an image.
 * - RecognizeStudentsInput - The input type for the recognizeStudents function.
 * - RecognizeStudentsOutput - The return type for the recognizeStudents function.
 */

import { ai } from '@/ai/genkit';
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

export async function recognizeStudents(input: RecognizeStudentsInput): Promise<RecognizeStudentsOutput> {
  return recognizeStudentsFlow(input);
}

const knownStudents = ["Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Miller", "Ethan Davis"];

const prompt = ai.definePrompt({
  name: 'recognizeStudentsPrompt',
  input: { schema: RecognizeStudentsInputSchema },
  output: { schema: RecognizeStudentsOutputSchema },
  prompt: `You are an AI-powered attendance system for a classroom.
Your task is to identify which of the known students are present in the provided classroom photo.

Here is the list of all students in the class:
{{#each knownStudents}}
- {{{this}}}
{{/each}}

Analyze the photo and return a list of the names of the students you can identify.
If you do not see a student, do not include them in the list. Only list the students who are clearly visible.

Photo:
{{media url=photoDataUri}}
`,
});

const recognizeStudentsFlow = ai.defineFlow(
  {
    name: 'recognizeStudentsFlow',
    inputSchema: RecognizeStudentsInputSchema,
    outputSchema: RecognizeStudentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      ...input,
      // @ts-ignore - The prompt template can access this additional context
      knownStudents,
    });
    return output!;
  }
);
