
'use server';

/**
 * @fileOverview A multi-language, grade-adaptive content generation AI agent.
 *
 * - generateLocalizedContent - A function that handles the content generation process.
 * - GenerateLocalizedContentInput - The input type for the generateLocalizedContent function.
 * - GenerateLocalizedContentOutput - The return type for the generateLocalizedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateLocalizedContentInputSchema = z.object({
  prompt: z.string().describe('The topic or prompt to generate content from.'),
  contentType: z.string().describe('The type of content to generate (e.g., story, poem, quiz, explanation).'),
  gradeLevel: z.number().describe('The target grade level for the content.'),
  languages: z
    .string()
    .describe(
      'A comma separated list of ISO 639-1 language codes to generate the content in. Example: en,es,fr'
    ),
});
export type GenerateLocalizedContentInput = z.infer<
  typeof GenerateLocalizedContentInputSchema
>;

const GenerateLocalizedContentOutputSchema = z.record(
  z.string(),
  z.string()
).describe('A map of ISO 639-1 language codes to generated content.');

export type GenerateLocalizedContentOutput = z.infer<
  typeof GenerateLocalizedContentOutputSchema
>;

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
