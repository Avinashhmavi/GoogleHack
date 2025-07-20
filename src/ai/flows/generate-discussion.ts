'use server';

/**
 * @fileOverview Generates materials for a classroom discussion.
 *
 * - generateDiscussion - A function that generates discussion prompts, vocabulary, and viewpoints.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateDiscussionInputSchema,
    GenerateDiscussionOutputSchema,
    type GenerateDiscussionInput,
    type GenerateDiscussionOutput
} from './generate-discussion.types';

export async function generateDiscussion(input: GenerateDiscussionInput): Promise<GenerateDiscussionOutput> {
    return generateDiscussionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDiscussionPrompt',
    input: { schema: GenerateDiscussionInputSchema },
    output: { schema: GenerateDiscussionOutputSchema },
    prompt: `You are an expert in curriculum design and facilitating classroom discussions.
Your task is to generate a set of materials for a teacher to lead a dialogic activity based on a given topic for a specific grade level.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}

Please generate the following:
1.  A set of open-ended discussion questions that encourage critical thinking.
2.  A list of key vocabulary words with student-friendly definitions.
3.  A summary of different viewpoints or arguments related to the topic to help students see multiple perspectives.

The tone should be appropriate for the specified grade level.
`,
});

const generateDiscussionFlow = ai.defineFlow(
    {
        name: 'generateDiscussionFlow',
        inputSchema: GenerateDiscussionInputSchema,
        outputSchema: GenerateDiscussionOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
