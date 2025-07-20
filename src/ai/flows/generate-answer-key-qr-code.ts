'use server';
/**
 * @fileOverview Generates a QR code for an answer key.
 *
 * - generateAnswerKeyQrCode - A function that generates a QR code for an answer key.
 * - GenerateAnswerKeyQrCodeInput - The input type for the generateAnswerKeyQrCode function.
 * - GenerateAnswerKeyQrCodeOutput - The return type for the generateAnswerKeyQrCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import QRCode from 'qrcode';

const GenerateAnswerKeyQrCodeInputSchema = z.object({
  answerKey: z.string().describe('The answer key to be encoded in the QR code.'),
});
export type GenerateAnswerKeyQrCodeInput = z.infer<typeof GenerateAnswerKeyQrCodeInputSchema>;

const GenerateAnswerKeyQrCodeOutputSchema = z.object({
  qrCodeDataUri: z
    .string()
    .describe('The QR code as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type GenerateAnswerKeyQrCodeOutput = z.infer<typeof GenerateAnswerKeyQrCodeOutputSchema>;

export async function generateAnswerKeyQrCode(input: GenerateAnswerKeyQrCodeInput): Promise<GenerateAnswerKeyQrCodeOutput> {
  return generateAnswerKeyQrCodeFlow(input);
}

const generateAnswerKeyQrCodeFlow = ai.defineFlow(
  {
    name: 'generateAnswerKeyQrCodeFlow',
    inputSchema: GenerateAnswerKeyQrCodeInputSchema,
    outputSchema: GenerateAnswerKeyQrCodeOutputSchema,
  },
  async input => {
    const qrCodeDataUri = await QRCode.toDataURL(input.answerKey);
    return {qrCodeDataUri};
  }
);
