import { z } from 'zod';

export const GenerateVideoInputSchema = z.object({
  prompt: z.string().min(1, 'Video prompt is required'),
  duration: z.number().min(5).max(25),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']),
  style: z.enum(['realistic', 'cinematic', 'animated', 'artistic']),
  quality: z.enum(['standard', 'high', 'ultra']),
});

export const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string(),
  videoId: z.string(),
  prompt: z.string(),
  duration: z.number(),
  aspectRatio: z.string(),
  style: z.string(),
  quality: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  error: z.string().optional(),
});

export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>; 