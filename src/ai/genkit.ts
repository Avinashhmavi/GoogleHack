import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({projectId: process.env.GOOGLE_PROJECT_ID})],
  model: 'googleai/gemini-2.0-flash',
});
