'use server';

/**
 * @fileOverview An AI agent that generates a YouTube search URL for educational videos.
 * 
 * - searchYoutubeVideos - A function that creates a search URL based on a query.
 */

import { ai } from '@/ai/genkit';
import {
    SearchYoutubeVideosInputSchema,
    SearchYoutubeVideosOutputSchema,
    type SearchYoutubeVideosInput,
    type SearchYoutubeVideosOutput
} from './search-youtube-videos.types';

const searchYoutubeVideosFlow = ai.defineFlow(
    {
        name: 'searchYoutubeVideosFlow',
        inputSchema: SearchYoutubeVideosInputSchema,
        outputSchema: SearchYoutubeVideosOutputSchema,
    },
    async (input) => {
        const { grade, subject, topic, language } = input;
        const queryParts = ['educational video'];
        if (language) queryParts.push(`in ${language}`);
        if (grade) queryParts.push(`for grade ${grade}`);
        if (subject) queryParts.push(subject);
        queryParts.push(`about ${topic}`);
        
        const searchQuery = queryParts.join(' ');
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            searchQuery
        )}`;
        
        return { searchUrl };
    }
);


export async function searchYoutubeVideos(input: SearchYoutubeVideosInput): Promise<SearchYoutubeVideosOutput> {
    return searchYoutubeVideosFlow(input);
}
