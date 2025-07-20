/**
 * @fileOverview Type definitions for the create-lesson-plan flow.
 */
import { z } from 'genkit';

export const CreateLessonPlanInputSchema = z.object({
    topic: z.string().describe('The main subject or topic of the lesson.'),
    gradeLevel: z.number().describe('The target grade level for the students (e.g., 5 for 5th grade).'),
    durationInMinutes: z.number().describe('The total duration of the lesson in minutes.'),
    learningObjectives: z.array(z.string()).describe('A list of key learning objectives for the lesson.'),
});
export type CreateLessonPlanInput = z.infer<typeof CreateLessonPlanInputSchema>;

const ActivitySchema = z.object({
    name: z.string().describe('The name of the activity (e.g., "Introduction", "Group Work").'),
    description: z.string().describe('A detailed description of the activity and what students will do.'),
    duration: z.number().describe('The estimated time in minutes for this activity.'),
});

export const CreateLessonPlanOutputSchema = z.object({
    title: z.string().describe('The title of the lesson plan.'),
    objectives: z.array(z.string()).describe('A list of the learning objectives.'),
    materials: z.array(z.string()).describe('A list of required materials and resources for the lesson.'),
    activities: z.array(ActivitySchema).describe('A sequence of activities that make up the lesson.'),
});
export type CreateLessonPlanOutput = z.infer<typeof CreateLessonPlanOutputSchema>;
