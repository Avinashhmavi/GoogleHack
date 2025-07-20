'use server';

/**
 * @fileOverview A multi-language, grade-adaptive content generation AI agent.
 *
 * - generateLocalizedContent - A function that handles the content generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateLocalizedContentInputSchema, GenerateLocalizedContentOutputSchema, type GenerateLocalizedContentInput, type GenerateLocalizedContentOutput } from './generate-localized-content.types';


export async function generateLocalizedContent(
  input: GenerateLocalizedContentInput
): Promise<GenerateLocalizedContentOutput> {
  return generateLocalizedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocalizedContentPrompt',
  input: {schema: GenerateLocalizedContentInputSchema},
  output: {schema: GenerateLocalizedContentOutputSchema},
  prompt: `You are an expert multilingual curriculum developer. Your task is to generate a "{{contentType}}" based on the given prompt, specifically tailored for a grade {{gradeLevel}} audience.

The output should be generated for the following languages: {{{languages}}}.

You must respond with a JSON object where the keys are the ISO 639-1 language codes and the values are the generated content in that language.

Prompt: {{{prompt}}}
`,
});

const generateLocalizedContentFlow = ai.defineFlow(
  {
    name: 'generateLocalizedContentFlow',
    inputSchema: GenerateLocalizedContentInputSchema,
    outputSchema: GenerateLocalizedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      const languages = input.languages.split(',');
      const results: { [key: string]: string; } = {};
      languages.forEach(async language => {
        results[language] = `Translation not available for ${language}`;
      });
      return results;
    }

    return output;
  }
);
