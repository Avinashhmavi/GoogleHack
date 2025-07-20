/**
 * @fileOverview Type definitions for the create-presentation flow.
 */
import { z } from 'genkit';

export const CreatePresentationInputSchema = z.object({
    topic: z.string().describe('The main subject or topic of the presentation.'),
    numSlides: z.number().min(3).max(15).describe('The total number of slides to generate.'),
    additionalInstructions: z.string().optional().describe('Optional specific instructions or context for the presentation content.'),
});
export type CreatePresentationInput = z.infer<typeof CreatePresentationInputSchema>;

// Internal schema for the text-only part
const TextOnlySlideSchema = z.object({
    title: z.string().describe('The title of the slide.'),
    content: z.array(z.string()).describe('An array of bullet points for the slide content.'),
    speakerNotes: z.string().describe('Detailed speaker notes for the presenter.'),
    visualSuggestion: z.string().describe('A suggestion for a visual aid for the slide.'),
});

export const TextOnlyPresentationOutputSchema = z.object({
    title: z.string().describe('The overall title of the presentation.'),
    slides: z.array(TextOnlySlideSchema),
});


// Final output schema including the generated image
const FinalSlideSchema = z.object({
    title: z.string().describe('The title of the slide.'),
    content: z.array(z.string()).describe('An array of bullet points for the slide content.'),
    speakerNotes: z.string().describe('Detailed speaker notes for the presenter.'),
    imageDataUri: z.string().describe('The generated image for the slide as a data URI.'),
});

export const CreatePresentationOutputSchema = z.object({
    title: z.string().describe('The overall title of the presentation.'),
    slides: z.array(FinalSlideSchema).describe('An array of slide objects that make up the presentation.'),
});
export type CreatePresentationOutput = z.infer<typeof CreatePresentationOutputSchema>;
