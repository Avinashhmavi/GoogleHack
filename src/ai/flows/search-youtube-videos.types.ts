/**
 * @fileOverview Type definitions for the search-youtube-videos flow.
 */
import { z } from 'genkit';

export const SearchYoutubeVideosInputSchema = z.object({
  grade: z.string().optional().describe('The target grade level for the video content.'),
  subject: z.string().optional().describe('The subject of the video.'),
  topic: z.string().describe('The specific topic to search for.'),
  language: z.string().optional().describe('The language of the video content (e.g., "English", "Hindi").'),
});
export type SearchYoutubeVideosInput = z.infer<typeof SearchYoutubeVideosInputSchema>;


export const SearchYoutubeVideosOutputSchema = z.object({
  searchUrl: z.string().url().describe('The URL for the YouTube search results page.'),
});
export type SearchYoutubeVideosOutput = z.infer<typeof SearchYoutubeVideosOutputSchema>;
