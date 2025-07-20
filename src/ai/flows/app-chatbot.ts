'use server';

/**
 * @fileOverview A chatbot that can answer questions about the application.
 *
 * - appChatbot - A function that handles user queries about the app.
 */

import { ai } from '@/ai/genkit';
import {
    AppChatbotInputSchema,
    AppChatbotOutputSchema,
    type AppChatbotInput,
    type AppChatbotOutput
} from './app-chatbot.types';
import { menuItems } from '@/lib/menu-items';
import { z } from 'genkit';

const listAppFeaturesTool = ai.defineTool(
  {
    name: 'listAppFeatures',
    description: 'Lists the available features in the Sahayak AI application.',
    outputSchema: z.array(z.object({
        name: z.string(),
        description: z.string(),
        path: z.string()
    }))
  },
  async () => {
    return menuItems.map(item => ({
        name: item.labelKey,
        description: item.descriptionKey,
        path: item.href
    }));
  }
);


const prompt = ai.definePrompt({
    name: 'appChatbotPrompt',
    input: { schema: AppChatbotInputSchema },
    output: { schema: AppChatbotOutputSchema },
    tools: [listAppFeaturesTool],
    system: `You are a friendly and helpful chatbot assistant for the "Sahayak AI" application.
Your goal is to answer user questions about the app's features and help them understand how to use it.
Use the 'listAppFeatures' tool to get information about the available features.
Keep your answers concise and helpful. If a user asks where to find something, provide the name of the feature and suggest they use the navigation menu.
If the user asks a question that is not related to the Sahayak AI app, politely decline to answer and state that you can only help with questions about the application.`,
});


export async function appChatbot(input: AppChatbotInput): Promise<AppChatbotOutput> {
  const llmResponse = await ai.generate({
    prompt: input.query,
    model: 'googleai/gemini-2.0-flash',
    tools: [listAppFeaturesTool],
    toolConfig: { autoToolInference: true }
  });
  
  const text = llmResponse.text;

  if (!text) {
    throw new Error('The model did not return a text response.');
  }

  return { response: text };
}

const appChatbotFlow = ai.defineFlow(
  {
    name: 'appChatbotFlow',
    inputSchema: AppChatbotInputSchema,
    outputSchema: AppChatbotOutputSchema,
  },
  async (input) => {
    return await appChatbot(input);
  }
);
