
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
import * as textbookDataFromFile from '../../../grade_wise_subjects_pdf.json';
import { searchYoutubeVideos } from './search-youtube-videos';
import { z } from 'genkit';
import { Document } from '@genkit-ai/ai';
import type { Student } from '@/lib/firestore';
import { retrieveWithCodebase } from './codebase-retriever';


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
        
        const gradeMatch = lowerCaseQuery.match(/(?:grade|class)\s*(\d+)/);
        const grade = gradeMatch ? gradeMatch[1] : null;

        let subject: string | undefined;
        if (grade) {
            const gradeData = textbookDataFromFile.grades.find(g => g.grade === grade);
            if (gradeData) {
                const subjectInGrade = gradeData.subjects.find(s => lowerCaseQuery.includes(s.subject_name.toLowerCase()));
                if (subjectInGrade) {
                    subject = subjectInGrade.subject_name.toLowerCase();
                }
            }
        }
        
        if (!subject) {
            const allSubjects = textbookDataFromFile.grades.flatMap(g => g.subjects.map(s => s.subject_name.toLowerCase()));
            subject = allSubjects.find(s => lowerCaseQuery.includes(s));
        }

        const chapterMatch = lowerCaseQuery.match(/chapter\s*(\d+)/);
        const chapter = chapterMatch ? parseInt(chapterMatch[1]) : null;

        if (grade) {
            const gradeData = textbookDataFromFile.grades.find(g => g.grade === grade);
            if (gradeData) {
                if (subject) {
                    const subjectData = gradeData.subjects.find(s => s.subject_name.toLowerCase() === subject);
                    if (subjectData) {
                        if (chapter) {
                            const chapterLink = subjectData.pdf_links.find(link => {
                                const titleChapterMatch = link.title.match(/chapter\s*(\d+)/);
                                if (titleChapterMatch) {
                                    return parseInt(titleChapterMatch[1]) === chapter;
                                }
                                return false;
                            });
                            if (chapterLink) {
                                return [{ title: chapterLink.title, url: chapterLink.url }];
                            }
                        } else {
                            return subjectData.pdf_links.map(link => ({ title: link.title, url: link.url })).slice(0, 5);
                        }
                    }
                } else {
                    // If only grade is provided, return all subjects for that grade
                    return gradeData.subjects.flatMap(s => s.pdf_links.map(link => ({ title: `${s.subject_name} - ${link.title}`, url: link.url }))).slice(0, 10);
                }
            }
        }
        
        return [];
    }
);

const searchYoutubeVideosTool = ai.defineTool(
  {
    name: 'searchYoutubeVideos',
    description: 'Searches for educational videos on YouTube and returns a search URL.',
    inputSchema: z.object({
      topic: z.string().describe('The topic of the video to search for.'),
      grade: z.string().optional().describe('The grade level for the video.'),
      subject: z.string().optional().describe('The subject of the video.'),
      language: z.string().optional().describe('The language of the video.'),
    }),
    outputSchema: z.object({
      searchUrl: z.string(),
    }),
  },
  async (input) => {
    return await searchYoutubeVideos(input);
  }
);

const appChatbotFlow = ai.defineFlow(
  {
    name: 'appChatbotFlow',
    inputSchema: AppChatbotInputSchema,
    outputSchema: AppChatbotOutputSchema,
  },
  async (input) => {
    const context = await retrieveWithCodebase({ query: { content: [{ text: input.query }] } });
    const systemPrompt = `You are a helpful AI assistant for the Sahayak AI app. Your purpose is to help users understand and use the app's features.
You have access to the app's codebase, so you can answer detailed questions about how features work.
If you can answer the user's question, do so in a clear and concise way.
If you are asked for a feature or navigation path (e.g., "content creator", "presentation creator", "quiz generator", "grade tracking", "smart class", "calendar"), use the listAppFeatures tool to provide the navigation path.
If you are asked for a textbook, use the getTextbooks tool.
If you are asked for a video, use the searchYoutubeVideos tool.
Always provide clickable links if you mention a feature. The UI will handle it.`;
    const llmResponse = await ai.generate({
        messages: [
            { role: 'system', content: [{ text: systemPrompt }] },
            ...(input.history || []),
            { role: 'user', content: [{ text: input.query }] }
        ],
        model: 'googleai/gemini-1.5-flash',
        tools: [listAppFeaturesTool, getTextbooksTool, searchYoutubeVideosTool],
        context,
    });
  
    let text = llmResponse.text;


    if (!text) {
        text = "I'm sorry, I couldn't find an answer for that. Could you please rephrase?";
    }

    return { response: text };
  }
);


export async function appChatbot(input: AppChatbotInput): Promise<AppChatbotOutput> {
    return appChatbotFlow(input);
}
