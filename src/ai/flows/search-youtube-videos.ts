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


const searchYouTubeTool = ai.defineTool(
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
            throw new Error('YouTube API key is not configured.');
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error:', errorData);
            throw new Error(`YouTube API request failed with status ${response.status}`);
        }
        
        const data = await response.json();

        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails.default.url,
        }));
    }
);


const searchYoutubeVideosFlow = ai.defineFlow(
    {
        name: 'searchYoutubeVideosFlow',
        inputSchema: SearchYoutubeVideosInputSchema,
        outputSchema: SearchYoutubeVideosOutputSchema,
    },
    async (input) => {
        const searchQuery = `educational video for grade ${input.grade} ${input.subject} about ${input.topic}`;
        
        const videos = await searchYouTubeTool({ query: searchQuery });
        
        return { videos };
    }
);


export async function searchYoutubeVideos(input: SearchYoutubeVideosInput): Promise<SearchYoutubeVideosOutput> {
    return searchYoutubeVideosFlow(input);
}
