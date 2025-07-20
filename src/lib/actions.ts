"use server";

import {
  adaptContentGradeLevel,
  type AdaptContentGradeLevelInput,
} from "@/ai/flows/adapt-content-grade-level";
import {
  generateAnswerKeyQrCode,
  type GenerateAnswerKeyQrCodeInput,
} from "@/ai/flows/generate-answer-key-qr-code";
import {
  generateMultiLanguageContent,
  type GenerateMultiLanguageContentInput,
} from "@/ai/flows/generate-multi-language-content";
import {
  photoToWorksheet,
  type PhotoToWorksheetInput,
} from "@/ai/flows/photo-to-worksheet";

export async function adaptContentAction(input: AdaptContentGradeLevelInput) {
  try {
    const result = await adaptContentGradeLevel(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to adapt content." };
  }
}

export async function generateQrCodeAction(input: GenerateAnswerKeyQrCodeInput) {
  try {
    const result = await generateAnswerKeyQrCode(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate QR code." };
  }
}

export async function generateMultiLanguageAction(
  input: GenerateMultiLanguageContentInput
) {
  try {
    const result = await generateMultiLanguageContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate content." };
  }
}

export async function photoToWorksheetAction(input: PhotoToWorksheetInput) {
  try {
    const result = await photoToWorksheet(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate worksheet." };
  }
}
