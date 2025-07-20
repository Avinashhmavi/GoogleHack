/**
 * @fileOverview Type definitions for the create-worksheet flow.
 */
import { z } from 'genkit';

export const CreateWorksheetInputSchema = z.object({
    topic: z.string().describe('The main subject or topic of the worksheet.'),
    gradeLevel: z.number().describe('The target grade level for the students (e.g., 5 for 5th grade).'),
    numQuestions: z.number().min(3).max(20).describe('The total number of questions to generate.'),
});
export type CreateWorksheetInput = z.infer<typeof CreateWorksheetInputSchema>;

const QuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    type: z.enum(['multiple-choice', 'short-answer', 'true-false', 'fill-in-the-blank']).describe('The type of question.'),
    options: z.array(z.string()).optional().describe('An array of possible answers for multiple-choice questions.'),
    answer: z.string().describe('The correct answer. For multiple choice, this is the text of the correct option. For true/false, it is "True" or "False".'),
});

export const CreateWorksheetOutputSchema = z.object({
    title: z.string().describe('The title of the worksheet.'),
    questions: z.array(QuestionSchema).describe('An array of worksheet questions.'),
});
export type CreateWorksheetOutput = z.infer<typeof CreateWorksheetOutputSchema>;
