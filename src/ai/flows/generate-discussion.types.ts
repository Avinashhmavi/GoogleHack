/**
 * @fileOverview Type definitions for the generate-discussion flow.
 */
import { z } from 'genkit';

export const GenerateDiscussionInputSchema = z.object({
    topic: z.string().describe('The central topic for the discussion.'),
    gradeLevel: z.number().describe('The target grade level for the discussion.'),
});
export type GenerateDiscussionInput = z.infer<typeof GenerateDiscussionInputSchema>;

const VocabularySchema = z.object({
    word: z.string().describe('The vocabulary word.'),
    definition: z.string().describe('A student-friendly definition of the word.'),
});

const ViewpointSchema = z.object({
    title: z.string().describe('The title or name of the viewpoint/argument.'),
    summary: z.string().describe('A summary of the viewpoint or argument.'),
});

export const GenerateDiscussionOutputSchema = z.object({
    discussionQuestions: z.array(z.string()).describe('A list of open-ended discussion questions.'),
    vocabulary: z.array(VocabularySchema).describe('A list of key vocabulary words and their definitions.'),
    viewpoints: z.array(ViewpointSchema).describe('A list of different viewpoints or perspectives on the topic.'),
});
export type GenerateDiscussionOutput = z.infer<typeof GenerateDiscussionOutputSchema>;
