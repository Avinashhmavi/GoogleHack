'use server';

/**
 * @fileOverview Creates a detailed lesson plan.
 *
 * - createLessonPlan - A function that generates a lesson plan based on topic, grade, and duration.
 */

import { ai } from '@/ai/genkit';
import {
    CreateLessonPlanInputSchema,
    CreateLessonPlanOutputSchema,
    type CreateLessonPlanInput,
    type CreateLessonPlanOutput
} from './create-lesson-plan.types';

export async function createLessonPlan(input: CreateLessonPlanInput): Promise<CreateLessonPlanOutput> {
    return createLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createLessonPlanPrompt',
    input: { schema: CreateLessonPlanInputSchema },
    output: { schema: CreateLessonPlanOutputSchema },
    prompt: `You are an expert curriculum designer for K-12 education. Create a comprehensive lesson plan based on the following details.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
Lesson Duration (in minutes): {{{durationInMinutes}}}
Learning Objectives:
{{#each learningObjectives}}
- {{{this}}}
{{/each}}

Generate a lesson plan that includes:
1.  A clear title.
2.  A summary of the main learning objectives.
3.  A list of required materials.
4.  A detailed, step-by-step sequence of activities, each with a name, description, and estimated duration. The total duration of all activities should roughly match the total lesson duration.

Structure the activities logically: start with an introduction/hook, followed by main learning activities, and end with a wrap-up or assessment.
`,
});


const createLessonPlanFlow = ai.defineFlow(
    {
        name: 'createLessonPlanFlow',
        inputSchema: CreateLessonPlanInputSchema,
        outputSchema: CreateLessonPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
