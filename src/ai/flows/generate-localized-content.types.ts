/**
 * @fileOverview Type definitions for the generate-localized-content flow.
 */
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

export const GenerateLocalizedContentOutputSchema = z.record(
  z.string(),
  z.string()
).describe('A map of ISO 639-1 language codes to generated content.');

export type GenerateLocalizedContentOutput = z.infer<
  typeof GenerateLocalizedContentOutputSchema
>;
