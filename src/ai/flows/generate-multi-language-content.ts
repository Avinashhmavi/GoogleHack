'use server';

/**
 * @fileOverview A multi-language content generation AI agent.
 *
 * - generateMultiLanguageContent - A function that handles the content generation process.
 * - GenerateMultiLanguageContentInput - The input type for the generateMultiLanguageContent function.
 * - GenerateMultiLanguageContentOutput - The return type for the generateMultiLanguageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMultiLanguageContentInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate content from.'),
  languages: z
    .string()
    .describe(
      'A comma separated list of ISO 639-1 language codes to generate the content in. Example: en,es,fr'
    ),
});
export type GenerateMultiLanguageContentInput = z.infer<
  typeof GenerateMultiLanguageContentInputSchema
>;

const GenerateMultiLanguageContentOutputSchema = z.record(
  z.string(),
  z.string()
).describe('A map of ISO 639-1 language codes to generated content.');

export type GenerateMultiLanguageContentOutput = z.infer<
  typeof GenerateMultiLanguageContentOutputSchema
>;

export async function generateMultiLanguageContent(
  input: GenerateMultiLanguageContentInput
): Promise<GenerateMultiLanguageContentOutput> {
  return generateMultiLanguageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMultiLanguageContentPrompt',
  input: {schema: GenerateMultiLanguageContentInputSchema},
  output: {schema: GenerateMultiLanguageContentOutputSchema},
  prompt: `You are a multilingual content creation AI. You will generate content from the given prompt in the specified languages.

Prompt: {{{prompt}}}

You must respond with a JSON object that has language ISO codes as keys and the generated content in that language as values.

Languages: {{{languages}}}`,
});

const generateMultiLanguageContentFlow = ai.defineFlow(
  {
    name: 'generateMultiLanguageContentFlow',
    inputSchema: GenerateMultiLanguageContentInputSchema,
    outputSchema: GenerateMultiLanguageContentOutputSchema,
  },
  async input => {
    const languages = input.languages.split(',');
    const results: {
      [key: string]: string;
    } = {};

    const {output} = await prompt(input);

    if (output) {
      return output;
    } else {
      languages.forEach(async language => {
        results[language] = `Translation not available for ${language}`;
      });
    }
    return results;
  }
);
