/**
 * @fileOverview Type definitions for the search-youtube-videos flow.
 */
import { z } from 'genkit';

export const SearchYoutubeVideosInputSchema = z.object({
  grade: z.string().describe('The target grade level for the video content.'),
  subject: z.string().describe('The subject of the video.'),
  topic: z.string().describe('The specific topic to search for.'),
  language: z.string().describe('The language of the video content (e.g., "English", "Hindi").'),
});
export type SearchYoutubeVideosInput = z.infer<typeof SearchYoutubeVideosInputSchema>;


export const YouTubeVideoSchema = z.object({
  id: z.string().describe('The YouTube video ID.'),
  title: z.string().describe('The title of the YouTube video.'),
  description: z.string().describe('A brief description of the video.'),
  channelTitle: z.string().describe('The name of the YouTube channel that published the video.'),
  thumbnailUrl: z.string().url().describe('The URL of the video thumbnail image.'),
});
export type YouTubeVideo = z.infer<typeof YouTubeVideoSchema>;


export const SearchYoutubeVideosOutputSchema = z.object({
  videos: z.array(YouTubeVideoSchema).describe('A list of relevant YouTube videos found.'),
});
export type SearchYoutubeVideosOutput = z.infer<typeof SearchYoutubeVideosOutputSchema>;
