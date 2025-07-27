
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

**GRADE PERFORMANCE ANALYSIS:**
Overall Average Grade: {{gradeAnalysis.averageGrade}}%
Total Grades Recorded: {{gradeAnalysis.totalGrades}}
Grade Trend: {{gradeAnalysis.gradeTrend}}

Subject Strengths: {{#each gradeAnalysis.subjectStrengths}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
Subject Weaknesses: {{#each gradeAnalysis.subjectWeaknesses}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**DETAILED GRADE HISTORY:**
{{#each gradeData}}
- {{subject}}: {{grade}}% ({{date}}) - Class: {{className}}
{{/each}}

**TEACHER OBSERVATIONS:**
Identified Problems/Challenges:
{{#each problems}}
- {{{this}}}
{{/each}}

Recent Progress / Strengths:
"{{progress}}"

Your task is to generate a comprehensive mentorship plan that includes:
1. A concise title for the plan that reflects both academic and personal development needs.
2. A list of 3-4 clear, achievable goals for the student, considering their grade performance and identified challenges.
3. A list of suggested activities or interventions the teacher can implement, specifically targeting areas of weakness while building on strengths. For each activity, provide a name and a detailed description.
4. A section on how to check for progress, including specific academic and behavioral indicators to monitor.

**IMPORTANT GUIDELINES:**
- Use the grade data to identify specific academic areas that need attention
- Consider the grade trend (improving/declining/stable) when setting goals
- Balance academic support with the personal challenges mentioned
- Provide specific, actionable recommendations based on the student's performance patterns
- The tone should be supportive, actionable, and tailored to the student's grade level and performance level

The plan should be data-driven, personalized, and address both academic and personal development needs.
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
