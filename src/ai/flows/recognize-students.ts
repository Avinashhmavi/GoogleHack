'use server';

/**
 * @fileOverview An AI agent that recognizes students from a class photo.
 *
 * - recognizeStudents - A function that identifies students in an image.
 */

import { ai } from '@/ai/genkit';
import {
    RecognizeStudentsInputSchema,
    RecognizeStudentsOutputSchema,
    type RecognizeStudentsInput,
    type RecognizeStudentsOutput
} from './recognize-students.types';


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
