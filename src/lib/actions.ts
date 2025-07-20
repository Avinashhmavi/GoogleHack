"use server";

import {
  adaptContentGradeLevel,
} from "@/ai/flows/adapt-content-grade-level";
import type { AdaptContentGradeLevelInput } from "@/ai/flows/adapt-content-grade-level";
import {
  generateAnswerKeyQrCode,
} from "@/ai/flows/generate-answer-key-qr-code";
import type { GenerateAnswerKeyQrCodeInput } from "@/ai/flows/generate-answer-key-qr-code";
import {
  generateMultiLanguageContent,
} from "@/ai/flows/generate-multi-language-content";
import type { GenerateMultiLanguageContentInput } from "@/ai/flows/generate-multi-language-content";
import {
  photoToWorksheet,
} from "@/ai/flows/photo-to-worksheet";
import type { PhotoToWorksheetInput } from "@/ai/flows/photo-to-worksheet";
import {
  generateQuiz,
} from "@/ai/flows/generate-quiz";
import type { GenerateQuizInput } from "@/ai/flows/generate-quiz";
import {
  createRubric,
} from "@/ai/flows/create-rubric";
import type { CreateRubricInput } from "@/ai/flows/create-rubric";
import {
  textToSpeech,
} from "@/ai/flows/text-to-speech";
import {
  enhanceWriting,
} from "@/ai/flows/enhance-writing";
import type { EnhanceWritingInput } from "@/ai/flows/enhance-writing.types";
import {
  recognizeStudents,
} from "@/ai/flows/recognize-students";
import type { RecognizeStudentsInput } from "@/ai/flows/recognize-students.types";
import { studentRoster } from "./student-roster";
import type { Student } from "./student-roster";

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

export async function textToSpeechAction(input: { text: string }) {
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

export async function recognizeStudentsAction(input: RecognizeStudentsInput) {
  try {
    const result = await recognizeStudents(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to recognize students.";
    return { success: false, error: message };
  }
}

// Student Roster Actions
export async function getStudentsAction() {
  try {
    const students = studentRoster.getStudents();
    return { success: true, data: students };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get students.";
    return { success: false, error: message };
  }
}

export async function addStudentAction(student: Omit<Student, 'id'>) {
  try {
    studentRoster.addStudent(student);
    const students = studentRoster.getStudents();
    return { success: true, data: students };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add student.";
    return { success: false, error: message };
  }
}

export async function deleteStudentAction(id: string) {
  try {
    studentRoster.deleteStudent(id);
    const students = studentRoster.getStudents();
    return { success: true, data: students };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete student.";
    return { success: false, error: message };
  }
}
