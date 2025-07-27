
/**
 * @fileOverview Type definitions for the create-mentorship-plan flow.
 */
import { z } from 'genkit';

const GradeDataSchema = z.object({
  subject: z.string().describe('The subject name.'),
  grade: z.number().describe('The grade percentage (0-100).'),
  date: z.string().describe('The date when the grade was recorded.'),
  className: z.string().describe('The class name.'),
});

export const CreateMentorshipPlanInputSchema = z.object({
  studentName: z.string().describe("The student's name."),
  gradeLevel: z.number().describe('The target grade level for the student (e.g., 5 for 5th grade).'),
  problems: z.array(z.string()).describe('A list of problems or challenges the student is facing.'),
  progress: z.string().describe("A summary of the student's recent progress or strengths."),
  gradeData: z.array(GradeDataSchema).describe('Historical grade data for the student across subjects.'),
  gradeAnalysis: z.object({
    averageGrade: z.number().describe('The student\'s overall average grade.'),
    subjectStrengths: z.array(z.string()).describe('Subjects where the student performs well.'),
    subjectWeaknesses: z.array(z.string()).describe('Subjects where the student needs improvement.'),
    gradeTrend: z.string().describe('Trend analysis (improving, declining, or stable).'),
    totalGrades: z.number().describe('Total number of grades recorded.'),
  }).describe('Analysis of the student\'s grade performance.'),
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
