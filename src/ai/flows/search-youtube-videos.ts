
'use server';

/**
 * @fileOverview An AI agent that searches for educational YouTube videos.
 * 
 * - searchYoutubeVideos - A function that finds relevant videos based on a query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
    SearchYoutubeVideosInputSchema,
    SearchYoutubeVideosOutputSchema,
    type SearchYoutubeVideosInput,
    type SearchYoutubeVideosOutput,
    YouTubeVideoSchema
} from './search-youtube-videos.types';


export const searchYouTubeTool = ai.defineTool(
    {
        name: 'searchYouTube',
        description: 'Searches YouTube for videos based on a query and returns the top results.',
        inputSchema: z.object({
            query: z.string().describe('The search query for YouTube.'),
        }),
        outputSchema: z.array(YouTubeVideoSchema),
    },
    async ({ query }) => {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!apiKey) {
            // In a real app, you might want to have a fallback or handle this more gracefully
            // For the prototype, we can return an empty array or a mock response
            console.warn('YouTube API key is not configured. Returning empty results.');
            return [];
            // Or throw new Error('YouTube API key is not configured.');
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('YouTube API Error:', errorData);
                // Don't throw an error that breaks the whole app, just return empty results
                return [];
            }
            
            const data = await response.json();

            return data.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                channelTitle: item.snippet.channelTitle,
                thumbnailUrl: item.snippet.thumbnails.default.url,
            }));
        } catch (fetchError) {
             console.error('Failed to fetch from YouTube API:', fetchError);
             return [];
        }
    }
);


const searchYoutubeVideosFlow = ai.defineFlow(
    {
        name: 'searchYoutubeVideosFlow',
        inputSchema: SearchYoutubeVideosInputSchema,
        outputSchema: SearchYoutubeVideosOutputSchema,
    },
    async (input) => {
        const searchQuery = `educational video in ${input.language} for grade ${input.grade} ${input.subject} about ${input.topic}`;
        
        const videos = await searchYouTubeTool({ query: searchQuery });
        
        return { videos };
    }
);


export async function searchYoutubeVideos(input: SearchYoutubeVideosInput): Promise<SearchYoutubeVideosOutput> {
    return searchYoutubeVideosFlow(input);
}
