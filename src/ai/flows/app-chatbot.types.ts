/**
 * @fileOverview Type definitions for the app-chatbot flow.
 */
import { z } from 'genkit';

export const AppChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s question about the app.'),
});
export type AppChatbotInput = z.infer<typeof AppChatbotInputSchema>;

export const AppChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s answer to the user\'s query.'),
});
export type AppChatbotOutput = z.infer<typeof AppChatbotOutputSchema>;
