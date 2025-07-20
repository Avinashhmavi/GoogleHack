
/**
 * @fileOverview Type definitions for the create-mentorship-plan flow.
 */
import { z } from 'genkit';

export const CreateMentorshipPlanInputSchema = z.object({
  studentName: z.string().describe("The student's name."),
  gradeLevel: z.number().describe('The target grade level for the student (e.g., 5 for 5th grade).'),
  problems: z.array(z.string()).describe('A list of problems or challenges the student is facing.'),
  progress: z.string().describe("A summary of the student's recent progress or strengths."),
});
export type CreateMentorshipPlanInput = z.infer<typeof CreateMentorshipPlanInputSchema>;


const ActivitySchema = z.object({
    name: z.string().describe('The name of the suggested activity or intervention.'),
    description: z.string().describe('A brief description of the activity.'),
});

export const CreateMentorshipPlanOutputSchema = z.object({
    planTitle: z.string().describe('The overall title of the mentorship plan.'),
    goals: z.array(z.string()).describe('A list of clear, achievable goals for the student.'),
    suggestedActivities: z.array(ActivitySchema).describe('A list of suggested activities or interventions.'),
    progressCheck: z.string().describe('Guidance on how to check for the student\'s progress.'),
});
export type CreateMentorshipPlanOutput = z.infer<typeof CreateMentorshipPlanOutputSchema>;
