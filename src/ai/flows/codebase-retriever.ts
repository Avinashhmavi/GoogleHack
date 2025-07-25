import { chromaRetrieverRef } from 'genkitx-chromadb';
import { ai } from '../genkit';
import { Document } from '@genkit-ai/ai';

// Get a reference to the codebase retriever
export const codebaseRetriever = chromaRetrieverRef({
  collectionName: 'codebase-collection',
});

// Wrap it with error handling
export const retrieveWithCodebase = async (input: { query: { content: Array<{ text: string }> } }) => {
  try {
    return await ai.retrieve({ retriever: codebaseRetriever, query: input.query });
  } catch (error) {
    console.warn('ChromaDB not available, returning empty context:', error);
    // Return empty context if ChromaDB is unreachable
    return [] as Document[];
  }
};
