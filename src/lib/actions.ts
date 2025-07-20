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
import {
  generateQuiz,
  type GenerateQuizInput,
} from "@/ai/flows/generate-quiz";
import {
  createRubric,
  type CreateRubricInput,
} from "@/ai/flows/create-rubric";
import {
  textToSpeech,
  type TextToSpeechInput,
} from "@/ai/flows/text-to-speech";
import {
  enhanceWriting,
  type EnhanceWritingInput,
} from "@/ai/flows/enhance-writing";


export async function adaptContentAction(input: AdaptContentGradeLevelInput) {
  try {
    const result = await adaptContentGradeLevel(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to adapt content.";
    return { success: false, error: message };
  }
}

export async function generateQrCodeAction(input: GenerateAnswerKeyQrCodeInput) {
  try {
    const result = await generateAnswerKeyQrCode(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to generate QR code.";
    return { success: false, error: message };
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
    const message = error instanceof Error ? error.message : "Failed to generate content.";
    return { success: false, error: message };
  }
}

export async function photoToWorksheetAction(input: PhotoToWorksheetInput) {
  try {
    const result = await photoToWorksheet(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to generate worksheet.";
    return { success: false, error: message };
  }
}

export async function generateQuizAction(input: GenerateQuizInput) {
  try {
    const result = await generateQuiz(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz.";
    return { success: false, error: message };
  }
}

export async function createRubricAction(input: CreateRubricInput) {
    try {
        const result = await createRubric(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to create rubric.";
        return { success: false, error: message };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    try {
        const result = await textToSpeech(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to convert text to speech.";
        return { success: false, error: message };
    }
}

export async function enhanceWritingAction(input: EnhanceWritingInput) {
  try {
    const result = await enhanceWriting(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to enhance writing.";
    return { success: false, error: message };
  }
}
