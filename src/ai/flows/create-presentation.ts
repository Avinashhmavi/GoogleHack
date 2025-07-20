'use server';

/**
 * @fileOverview Creates a presentation with slides.
 *
 * - createPresentation - A function that generates presentation slides based on a topic.
 */

import { ai } from '@/ai/genkit';
import {
    CreatePresentationInputSchema,
    CreatePresentationOutputSchema,
    type CreatePresentationInput,
    type CreatePresentationOutput
} from './create-presentation.types';

export async function createPresentation(input: CreatePresentationInput): Promise<CreatePresentationOutput> {
    return createPresentationFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createPresentationPrompt',
    input: { schema: CreatePresentationInputSchema },
    output: { schema: CreatePresentationOutputSchema },
    prompt: `You are an expert at creating educational presentations.
Your task is to generate a set of presentation slides based on the given topic for a specific number of slides.

Topic: {{{topic}}}
Number of Slides: {{{numSlides}}}

For each slide, you must generate:
1.  A concise title.
2.  Bulleted content points (3-5 points per slide).
3.  Detailed speaker notes that elaborate on the bullet points.
4.  A descriptive suggestion for a relevant visual aid (e.g., "a diagram of the water cycle", "a photo of the Amazon rainforest").

The presentation should have a logical flow, starting with an introduction, followed by the main content, and ending with a conclusion or summary slide.
`,
});


const createPresentationFlow = ai.defineFlow(
    {
        name: 'createPresentationFlow',
        inputSchema: CreatePresentationInputSchema,
        outputSchema: CreatePresentationOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
