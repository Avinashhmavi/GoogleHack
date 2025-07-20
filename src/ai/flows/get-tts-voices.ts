"use server";
/**
 * @fileOverview A helper flow to get available TTS voices for a given language.
 */

import { ai } from "@/ai/genkit";
import { listVoices, z } from "genkit/experimental/ai";
import { googleAI } from '@genkit-ai/googleai';

export const GetTtsVoicesOutputSchema = z.array(z.object({
  name: z.string(),
  service: z.string(),
  naturalSampleRateHertz: z.number().optional(),
  languageCodes: z.array(z.string()),
  gender: z.enum(["GENDER_UNSPECIFIED", "MALE", "FEMALE", "NEUTRAL"]),
}));
export type GetTtsVoicesOutput = z.infer<typeof GetTtsVoicesOutputSchema>;

export async function getTtsVoices(languageCode: string): Promise<GetTtsVoicesOutput> {
  const result = await listVoices({
    services: {
      googleAI: googleAI()
    },
    filter: (voice) => voice.languageCodes.includes(languageCode) && voice.service === 'googleAI',
  });
  return result;
}
