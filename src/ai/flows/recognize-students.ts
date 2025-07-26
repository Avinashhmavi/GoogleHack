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
    type RecognizeStudentsOutput,
    type RecognizeStudentsInputWithRoster
} from './recognize-students.types';


export async function recognizeStudents(input: RecognizeStudentsInputWithRoster): Promise<RecognizeStudentsOutput> {
  return recognizeStudentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeStudentsPrompt',
  input: { schema: RecognizeStudentsInputSchema },
  output: { schema: RecognizeStudentsOutputSchema },
  prompt: `You are an AI-powered attendance system for a classroom.
Your task is to identify which of the known students are present in the provided classroom photo.

IMPORTANT INSTRUCTIONS:
1. Only identify students with HIGH CONFIDENCE. If you're unsure, do not include them.
2. Look for clear, frontal face views with good lighting.
3. Pay attention to distinctive facial features, not just general appearance.
4. If multiple students look similar, be extra careful to match correctly.
5. Do not guess - only include students you are confident about.

Here is the list of all students in the class with their reference photos:
{{#each studentRoster}}
- Student Name: {{{this.name}}}
  Reference Photo: {{media url=this.photoDataUri}}
{{/each}}

Analyze the classroom photo provided by the user and compare the faces with the reference photos.
Return a list of the names of the students you can identify with high confidence.
If you do not see a student clearly, do not include them in the list.

Classroom Photo:
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
    const { output } = await prompt(input);
    return output!;
  }
);
