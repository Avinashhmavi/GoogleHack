/**
 * @fileOverview Type definitions for the get-tts-voices flow.
 */
import { z } from "genkit";

export const GetTtsVoicesOutputSchema = z.array(z.object({
  name: z.string(),
  service: z.string(),
  naturalSampleRateHertz: z.number().optional(),
  languageCodes: z.array(z.string()),
  gender: z.enum(["GENDER_UNSPECIFIED", "MALE", "FEMALE", "NEUTRAL"]),
}));
export type GetTtsVoicesOutput = z.infer<typeof GetTtsVoicesOutputSchema>;
