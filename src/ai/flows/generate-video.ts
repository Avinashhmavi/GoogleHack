'use server';

import {ai} from '@/ai/genkit';
import { GenerateVideoInputSchema, GenerateVideoOutputSchema, type GenerateVideoInput, type GenerateVideoOutput } from './generate-video.types';

// Veo 3 API configuration
const VEO3_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateContent';
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const generateVideoFlow = ai.defineFlow(
  {
    name: 'generate-video',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input: GenerateVideoInput): Promise<GenerateVideoOutput> => {
    try {
      // Validate input
      if (!input.prompt.trim()) {
        throw new Error('Video prompt is required');
      }

      if (input.duration < 5 || input.duration > 25) {
        throw new Error('Duration must be between 5 and 25 seconds');
      }

      if (!GEMINI_API_KEY) {
        throw new Error('Google Generative AI API key not configured');
      }

      // Generate video script using Gemini for better prompt engineering
      const videoPrompt = ai.definePrompt({
        name: 'videoGenerationPrompt',
        input: { schema: GenerateVideoInputSchema },
        prompt: `You are an expert video content creator. Generate a detailed video script and description based on the following parameters:

Prompt: {{prompt}}
Duration: {{duration}} seconds
Aspect Ratio: {{aspectRatio}}
Style: {{style}}
Quality: {{quality}}

Create a detailed video script that would be suitable for AI video generation. Include scene descriptions, timing, and visual elements.

Respond with a JSON object containing:
- videoScript: A detailed script for the video
- sceneBreakdown: Array of scenes with timing
- visualElements: Key visual elements to include
- audioDescription: Description of audio/narration needed`,
      });

      const scriptResult = await videoPrompt(input);
      
      // Generate unique video ID
      const videoId = `veo3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call Veo 3 API to generate actual video
      const veo3Response = await fetch(VEO3_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a ${input.duration}-second video with the following specifications:
                - Prompt: ${input.prompt}
                - Aspect Ratio: ${input.aspectRatio}
                - Style: ${input.style}
                - Quality: ${input.quality}
                - Video Script: ${scriptResult.text || input.prompt}
                
                Please create a high-quality video that matches these requirements.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      if (!veo3Response.ok) {
        const errorText = await veo3Response.text();
        throw new Error(`Veo 3 API error: ${veo3Response.status} - ${errorText}`);
      }
      
      const veo3Data = await veo3Response.json();
      
      // Extract video URL from Veo 3 response
      let videoUrl = '';
      if (veo3Data.candidates && veo3Data.candidates[0] && veo3Data.candidates[0].content) {
        const content = veo3Data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].inlineData) {
          // Handle inline video data
          const inlineData = content.parts[0].inlineData;
          if (inlineData.mimeType && inlineData.mimeType.startsWith('video/')) {
            videoUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
          }
        } else if (content.parts && content.parts[0] && content.parts[0].text) {
          // Handle text response with video URL
          const text = content.parts[0].text;
          const urlMatch = text.match(/https?:\/\/[^\s]+\.(mp4|webm|mov|avi)/i);
          if (urlMatch) {
            videoUrl = urlMatch[0];
          }
        }
      }
      
      // If no video URL found, throw error
      if (!videoUrl) {
        throw new Error('No video URL received from Veo 3 API');
      }
      
      return {
        videoUrl,
        videoId,
        prompt: input.prompt,
        duration: input.duration,
        aspectRatio: input.aspectRatio,
        style: input.style,
        quality: input.quality,
        status: 'completed',
      };
    } catch (error) {
      console.error('Video generation error:', error);
      return {
        videoUrl: '',
        videoId: '',
        prompt: input.prompt,
        duration: input.duration,
        aspectRatio: input.aspectRatio,
        style: input.style,
        quality: input.quality,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);

// Helper function to call the video generation flow
export async function generateVideoFlowAction(input: GenerateVideoInput): Promise<{ success: boolean; data?: GenerateVideoOutput; error?: string }> {
  try {
    const result = await generateVideoFlow(input);
    
    if (result.status === 'failed') {
      return {
        success: false,
        error: result.error || 'Video generation failed',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate video',
    };
  }
} 