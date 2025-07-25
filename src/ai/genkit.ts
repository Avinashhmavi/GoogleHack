import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {chroma} from 'genkitx-chromadb';

// Get ChromaDB configuration from environment variables
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const chromaApiKey = process.env.CHROMA_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI(),
    chroma([
      {
        collectionName: 'codebase-collection',
        embedder: googleAI.embedder('text-embedding-004'),
        clientParams: {
          path: chromaUrl,
          ...(chromaApiKey ? { fetchOptions: { headers: { 'Authorization': `Bearer ${chromaApiKey}` } } } : {})
        }
      },
    ]),
  ],
  model: 'googleai/gemini-2.0-flash',
});
