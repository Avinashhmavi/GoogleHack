'use server';

/**
 * @fileOverview Creates a grading rubric for an assignment.
 * 
 * - createRubric - A function that generates a rubric based on assignment details.
 * - CreateRubricInput - The input type for the createRubric function.
 * - CreateRubricOutput - The return type for the createRubric function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CriteriaSchema = z.object({
    name: z.string().describe('The name of the criterion, e.g., "Clarity" or "Grammar".'),
    levels: z.array(z.object({
        level: z.string().describe('The performance level, e.g., "Excellent", "Good", "Needs Improvement".'),
        description: z.string().describe('The description of what this performance level looks like for the criterion.'),
    })).describe('The different performance levels for this criterion.'),
});

const CreateRubricInputSchema = z.object({
    assignmentDescription: z.string().describe('A detailed description of the assignment.'),
    criteria: z.array(z.string()).describe('A list of criteria to be included in the rubric, e.g., "Clarity", "Originality".'),
});

export type CreateRubricInput = z.infer<typeof CreateRubricInputSchema>;

const CreateRubricOutputSchema = z.object({
    title: z.string().describe('The title of the rubric.'),
    criteria: z.array(CriteriaSchema).describe('The list of criteria and their performance levels.'),
});
export type CreateRubricOutput = z.infer<typeof CreateRubricOutputSchema>;

export async function createRubric(input: CreateRubricInput): Promise<CreateRubricOutput> {
    return createRubricFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createRubricPrompt',
    input: { schema: CreateRubricInputSchema },
    output: { schema: CreateRubricOutputSchema },
    prompt: `You are an expert in educational assessment. Create a detailed grading rubric based on the following assignment details.

Assignment Description: {{{assignmentDescription}}}

The rubric must include the following criteria: {{#each criteria}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

For each criterion, define at least three performance levels (e.g., Excellent, Good, Needs Improvement) with clear descriptions for each. The title of the rubric should be related to the assignment.
`,
});


const createRubricFlow = ai.defineFlow(
    {
        name: 'createRubricFlow',
        inputSchema: CreateRubricInputSchema,
        outputSchema: CreateRubricOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
