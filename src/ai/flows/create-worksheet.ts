'use server';

/**
 * @fileOverview Creates a worksheet with various question types.
 *
 * - createWorksheet - A function that generates a worksheet based on a topic.
 */

import { ai } from '@/ai/genkit';
import {
    CreateWorksheetInputSchema,
    CreateWorksheetOutputSchema,
    type CreateWorksheetInput,
    type CreateWorksheetOutput
} from './create-worksheet.types';

export async function createWorksheet(input: CreateWorksheetInput): Promise<CreateWorksheetOutput> {
    return createWorksheetFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createWorksheetPrompt',
    input: { schema: CreateWorksheetInputSchema },
    output: { schema: CreateWorksheetOutputSchema },
    prompt: `You are an expert educator creating a worksheet for students.
Create a worksheet on the given topic for the specified grade level.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
Number of Questions: {{{numQuestions}}}

The worksheet should include a mix of the following question types:
- Multiple Choice
- Short Answer
- True/False
- Fill in the blank

Generate a title for the worksheet and the specified number of questions. For multiple choice questions, provide 4 options.
`,
});


const createWorksheetFlow = ai.defineFlow(
    {
        name: 'createWorksheetFlow',
        inputSchema: CreateWorksheetInputSchema,
        outputSchema: CreateWorksheetOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
