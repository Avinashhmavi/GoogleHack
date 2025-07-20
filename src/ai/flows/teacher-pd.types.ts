
/**
 * @fileOverview Type definitions for the teacher professional development flow.
 */
import { z } from 'genkit';

export const ProfessionalDevelopmentInputSchema = z.object({
  learningGoal: z.string().describe('The skill or topic the teacher wants to learn about.'),
});
export type ProfessionalDevelopmentInput = z.infer<typeof ProfessionalDevelopmentInputSchema>;


const StepSchema = z.object({
    title: z.string().describe('The title of the learning step or focus area.'),
    description: z.string().describe('A brief description of this step.'),
    strategies: z.array(z.string()).describe('A list of concrete, actionable strategies for the teacher.'),
    youtubeSearchQuery: z.string().describe('An effective search query for finding relevant videos on YouTube.'),
});

export const ProfessionalDevelopmentOutputSchema = z.object({
    planTitle: z.string().describe('The overall title of the professional development plan.'),
    keyConcepts: z.array(z.string()).describe('A list of key concepts related to the learning goal.'),
    suggestedSteps: z.array(StepSchema).describe('An array of suggested steps to achieve the learning goal.'),
});
export type ProfessionalDevelopmentPlan = z.infer<typeof ProfessionalDevelopmentOutputSchema>;
export type ProfessionalDevelopmentOutput = z.infer<typeof ProfessionalDevelopmentOutputSchema>;
