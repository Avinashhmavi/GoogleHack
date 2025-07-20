"use server";
/**
 * @fileOverview A helper flow to get available TTS voices for a given language.
 */

import { ai } from "@/ai/genkit";
import { listVoices } from "genkit";
import { googleAI } from '@genkit-ai/googleai';
import type { GetTtsVoicesOutput } from "./get-tts-voices.types";

export async function getTtsVoices(languageCode: string): Promise<GetTtsVoicesOutput> {
  const result = await listVoices({
    services: {
      googleAI: googleAI()
    },
    filter: (voice) => voice.languageCodes.includes(languageCode) && voice.service === 'googleAI',
  });
  return result;
}
