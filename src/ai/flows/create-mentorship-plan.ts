
'use server';

/**
 * @fileOverview Creates a mentorship plan for a student.
 * 
 * - createMentorshipPlan - A function that generates a plan based on student challenges and progress.
 */

import { ai } from '@/ai/genkit';
import { 
    CreateMentorshipPlanInputSchema, 
    CreateMentorshipPlanOutputSchema,
    type CreateMentorshipPlanInput,
    type CreateMentorshipPlanOutput 
} from './create-mentorship-plan.types';

export async function createMentorshipPlan(input: CreateMentorshipPlanInput): Promise<CreateMentorshipPlanOutput> {
    return createMentorshipPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createMentorshipPlanPrompt',
    input: { schema: CreateMentorshipPlanInputSchema },
    output: { schema: CreateMentorshipPlanOutputSchema },
    prompt: `You are an expert educational psychologist and mentor for K-12 students.
A teacher needs a structured mentorship plan for a student.

Student Name: {{studentName}}
Grade Level: {{gradeLevel}}

Identified Problems/Challenges:
{{#each problems}}
- {{{this}}}
{{/each}}

Recent Progress / Strengths:
"{{progress}}"

Your task is to generate a mentorship plan that includes:
1.  A concise title for the plan.
2.  A list of 2-3 clear, achievable goals for the student.
3.  A list of suggested activities or interventions the teacher can implement to help the student. For each activity, provide a name and a brief description.
4.  A section on how to check for progress, including specific things to look for.

The tone should be supportive, actionable, and tailored to the student's grade level.
`,
});

const createMentorshipPlanFlow = ai.defineFlow(
    {
        name: 'createMentorshipPlanFlow',
        inputSchema: CreateMentorshipPlanInputSchema,
        outputSchema: CreateMentorshipPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
