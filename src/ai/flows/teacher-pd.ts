
'use server';

/**
 * @fileOverview Creates a professional development plan for teachers.
 * 
 * - getProfessionalDevelopmentPlan - A function that generates a learning plan based on a teacher's goal.
 */

import { ai } from '@/ai/genkit';
import { 
    ProfessionalDevelopmentInputSchema, 
    ProfessionalDevelopmentOutputSchema,
    type ProfessionalDevelopmentInput,
    type ProfessionalDevelopmentOutput 
} from './teacher-pd.types';

export async function getProfessionalDevelopmentPlan(input: ProfessionalDevelopmentInput): Promise<ProfessionalDevelopmentOutput> {
    return professionalDevelopmentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'professionalDevelopmentPrompt',
    input: { schema: ProfessionalDevelopmentInputSchema },
    output: { schema: ProfessionalDevelopmentOutputSchema },
    prompt: `You are an expert instructional coach and professional development leader for educators.
A teacher has a learning goal and needs a structured plan to achieve it.

Teacher's Learning Goal: {{{learningGoal}}}

Your task is to generate a professional development plan that includes:
1. A clear, concise title for the plan.
2. A list of key concepts the teacher should understand.
3. A set of 2-3 suggested steps or focus areas. For each step:
    a. Provide a clear title and a brief description.
    b. List 2-3 concrete, actionable strategies the teacher can implement.
    c. Create a highly effective, specific YouTube search query that will yield relevant, high-quality videos on this topic. The query should be in English and use keywords that educators or experts would use. For example, instead of "how to be better with students", a good query would be "classroom management techniques for student engagement".

The tone should be supportive, encouraging, and professional.
`,
});

const professionalDevelopmentFlow = ai.defineFlow(
    {
        name: 'professionalDevelopmentFlow',
        inputSchema: ProfessionalDevelopmentInputSchema,
        outputSchema: ProfessionalDevelopmentOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
