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
import { videoData } from '@/lib/smart-class-data';
import { textbookData } from '@/lib/textbook-data';
import { studentRoster } from '@/lib/student-roster';
import { z } from 'genkit';


const listAppFeaturesTool = ai.defineTool(
  {
    name: 'listAppFeatures',
    description: 'Lists the available features and their navigation paths in the Sahayak AI application.',
    outputSchema: z.array(z.object({
        name: z.string().describe('The key used for translation for the feature name'),
        description: z.string().describe('The key used for translation for the feature description'),
        path: z.string().describe('The navigation path for the feature, e.g., /quiz-generator')
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

const getSmartClassVideosTool = ai.defineTool(
    {
        name: 'getSmartClassVideos',
        description: 'Searches for and returns links to educational YouTube videos from the Smart Class library.',
        inputSchema: z.object({
            query: z.string().describe('A search query to find videos by title, subject, or grade.')
        }),
        outputSchema: z.array(z.object({
            title: z.string(),
            url: z.string().describe('The full YouTube watch URL.')
        }))
    },
    async ({ query }) => {
        const lowerCaseQuery = query.toLowerCase();
        const results = videoData
            .filter(video => 
                video.title.toLowerCase().includes(lowerCaseQuery) ||
                video.subject.toLowerCase().includes(lowerCaseQuery) ||
                video.grade.toString().toLowerCase().includes(lowerCaseQuery)
            )
            .map(video => ({
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.youtubeId}`
            }));
        return results.slice(0, 5); // Return max 5 results
    }
);

const getTextbooksTool = ai.defineTool(
    {
        name: 'getTextbooks',
        description: 'Searches for and returns links to digital textbooks.',
        inputSchema: z.object({
            query: z.string().describe('A search query to find textbooks by title, subject, or grade.')
        }),
        outputSchema: z.array(z.object({
            title: z.string(),
            url: z.string().describe('The direct URL to the textbook PDF.')
        }))
    },
    async ({ query }) => {
        const lowerCaseQuery = query.toLowerCase();
        const results = textbookData
            .filter(book => 
                book.title.toLowerCase().includes(lowerCaseQuery) ||
                book.subject.toLowerCase().includes(lowerCaseQuery) ||
                book.grade.toString().toLowerCase().includes(lowerCaseQuery)
            )
            .map(book => ({
                title: book.title,
                url: book.pdfUrl
            }));
        return results.slice(0, 3); // Return max 3 results
    }
);

const getStudentInfoTool = ai.defineTool(
    {
        name: 'getStudentInfo',
        description: "Retrieves information about a specific student from the roster.",
        inputSchema: z.object({
            studentName: z.string().describe("The full name of the student to search for.")
        }),
        outputSchema: z.object({
            name: z.string(),
            id: z.string()
        }).or(z.null())
    },
    async ({ studentName }) => {
        const lowerCaseName = studentName.toLowerCase();
        const student = studentRoster.getStudents().find(s => s.name.toLowerCase() === lowerCaseName);
        return student ? { name: student.name, id: student.id } : null;
    }
);


const appChatbotFlow = ai.defineFlow(
  {
    name: 'appChatbotFlow',
    inputSchema: AppChatbotInputSchema,
    outputSchema: AppChatbotOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
        prompt: `You are a friendly and helpful chatbot assistant for the "Sahayak AI" application.
Your goal is to answer user questions about the app, fetch resources, and help them navigate.
You have access to a set of tools to get information about the app's features, videos, textbooks, and students.
- Use the 'listAppFeatures' tool to talk about what the app can do or to provide navigation links.
- Use the 'getSmartClassVideos' tool when the user asks for a video on a topic.
- Use the 'getTextbooks' tool when the user asks for a textbook.
- Use the 'getStudentInfo' tool if the user asks for details about a specific student.
- If you provide a link, make sure it is a complete, clickable URL.
- If the user asks a question that is not related to the Sahayak AI app or its content, politely decline to answer and state that you can only help with questions about the application.

User question: "${input.query}"`,
        model: 'googleai/gemini-2.0-flash',
        tools: [listAppFeaturesTool, getSmartClassVideosTool, getTextbooksTool, getStudentInfoTool],
        toolConfig: { autoToolInference: true }
    });
  
    const text = llmResponse.text;

    if (!text) {
        throw new Error('The model did not return a text response.');
    }

    return { response: text };
  }
);


export async function appChatbot(input: AppChatbotInput): Promise<AppChatbotOutput> {
    return appChatbotFlow(input);
}
