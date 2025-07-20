
'use server';

/**
 * @fileOverview Creates a presentation with slides and generated images.
 *
 * - createPresentation - A function that generates presentation slides based on a topic.
 */

import { ai } from '@/ai/genkit';
import {
    CreatePresentationInputSchema,
    CreatePresentationOutputSchema,
    type CreatePresentationInput,
    type CreatePresentationOutput,
    TextOnlyPresentationOutputSchema
} from './create-presentation.types';

export async function createPresentation(input: CreatePresentationInput): Promise<CreatePresentationOutput> {
    return createPresentationFlow(input);
}

const textGenerationPrompt = ai.definePrompt({
    name: 'createPresentationTextPrompt',
    input: { schema: CreatePresentationInputSchema },
    output: { schema: TextOnlyPresentationOutputSchema },
    prompt: `You are an expert at creating educational presentations.
Your task is to generate a set of presentation slides based on the given topic for a specific number of slides.

Topic: {{{topic}}}
Number of Slides: {{{numSlides}}}

{{#if additionalInstructions}}
Follow these specific instructions: {{{additionalInstructions}}}
{{/if}}


For each slide, you must generate:
1.  A concise title.
2.  Bulleted content points (3-5 points per slide).
3.  Detailed speaker notes that elaborate on the bullet points.
4.  A descriptive suggestion for a relevant visual aid (e.g., "a diagram of the water cycle", "a photo of the Amazon rainforest"). This suggestion will be used as a prompt to an image generation AI. Make it descriptive.

The presentation should have a logical flow, starting with an introduction, followed by the main content, and ending with a conclusion or summary slide.
`,
});

async function generateImageForSlide(visualSuggestion: string): Promise<string> {
    const fullPrompt = `Generate a simple, educational, clean, visually appealing image for a presentation slide.

    Visual: ${visualSuggestion}`;
    
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: fullPrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media.url || '';
    } catch (error) {
        console.error("Image generation failed for prompt:", visualSuggestion, error);
        // Return a placeholder or empty string on failure
        return '';
    }
}


const createPresentationFlow = ai.defineFlow(
    {
        name: 'createPresentationFlow',
        inputSchema: CreatePresentationInputSchema,
        outputSchema: CreatePresentationOutputSchema,
    },
    async (input) => {
        // 1. Generate all the text content first
        const { output: textOutput } = await textGenerationPrompt(input);

        if (!textOutput) {
            throw new Error("Failed to generate presentation text content.");
        }

        // 2. Generate images for each slide in parallel
        const imagePromises = textOutput.slides.map(slide => 
            generateImageForSlide(slide.visualSuggestion)
        );

        const imageDataUris = await Promise.all(imagePromises);

        // 3. Combine text content with generated images
        const finalSlides = textOutput.slides.map((slide, index) => ({
            title: slide.title,
            content: slide.content,
            speakerNotes: slide.speakerNotes,
            imageDataUri: imageDataUris[index], // Add the generated image data URI
        }));

        return {
            title: textOutput.title,
            slides: finalSlides,
        };
    }
);
