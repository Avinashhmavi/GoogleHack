
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
  generateLocalizedContent,
} from "@/ai/flows/generate-localized-content";
import type { GenerateLocalizedContentInput } from "@/ai/flows/generate-localized-content.types";
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
import type { TextToSpeechInput } from "@/ai/flows/text-to-speech";
import {
  enhanceWriting,
} from "@/ai/flows/enhance-writing";
import type { EnhanceWritingInput } from "@/ai/flows/enhance-writing.types";
import {
  recognizeStudents,
} from "@/ai/flows/recognize-students";
import type { RecognizeStudentsInput } from "@/ai/flows/recognize-students.types";
import {
  createLessonPlan,
} from "@/ai/flows/create-lesson-plan";
import type { CreateLessonPlanInput } from "@/ai/flows/create-lesson-plan.types";
import {
  generateDiscussion
} from "@/ai/flows/generate-discussion";
import type { GenerateDiscussionInput } from "@/ai/flows/generate-discussion.types";
import {
  generateVisualAid
} from "@/ai/flows/generate-visual-aid";
import type { GenerateVisualAidInput } from "@/ai/flows/generate-visual-aid.types";
import {
  askSahayak
} from "@/ai/flows/ask-sahayak";
import type { AskSahayakInput } from "@/ai/flows/ask-sahayak.types";
import {
  getTtsVoices
} from "@/ai/flows/get-tts-voices";
import {
  createPresentation
} from "@/ai/flows/create-presentation";
import type { CreatePresentationInput } from "@/ai/flows/create-presentation.types";
import {
  getProfessionalDevelopmentPlan
} from "@/ai/flows/teacher-pd";
import type { ProfessionalDevelopmentInput } from "@/ai/flows/teacher-pd.types";
import {
  appChatbot
} from "@/ai/flows/app-chatbot";
import type { AppChatbotInput } from "@/ai/flows/app-chatbot.types";
import {
  createWorksheet,
} from "@/ai/flows/create-worksheet";
import type { CreateWorksheetInput } from "@/ai/flows/create-worksheet.types";


import { studentRoster } from "./student-roster";
import type { Student } from "./student-roster";

// Wrapper function to handle Genkit flow execution and error handling
async function runAction<I, O>(action: (input: I) => Promise<O>, input: I, errorMsg: string): Promise<{ success: true, data: O } | { success: false, error: string }> {
    try {
        const result = await action(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : errorMsg;
        return { success: false, error: message };
    }
}


export async function adaptContentAction(input: AdaptContentGradeLevelInput) {
  return runAction(adaptContentGradeLevel, input, "Failed to adapt content.");
}

export async function generateQrCodeAction(input: GenerateAnswerKeyQrCodeInput) {
  return runAction(generateAnswerKeyQrCode, input, "Failed to generate QR code.");
}

export async function generateLocalizedContentAction(
  input: GenerateLocalizedContentInput
) {
  return runAction(generateLocalizedContent, input, "Failed to generate content.");
}

export async function photoToWorksheetAction(input: PhotoToWorksheetInput) {
  return runAction(photoToWorksheet, input, "Failed to generate worksheet.");
}

export async function generateQuizAction(input: GenerateQuizInput) {
  return runAction(generateQuiz, input, "Failed to generate quiz.");
}

export async function createRubricAction(input: CreateRubricInput) {
    return runAction(createRubric, input, "Failed to create rubric.");
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    return runAction(textToSpeech, input, "Failed to convert text to speech.");
}

export async function enhanceWritingAction(input: EnhanceWritingInput) {
  return runAction(enhanceWriting, input, "Failed to enhance writing.");
}

export async function recognizeStudentsAction(input: RecognizeStudentsInput) {
  return runAction(recognizeStudents, input, "Failed to recognize students.");
}

export async function createLessonPlanAction(input: CreateLessonPlanInput) {
  return runAction(createLessonPlan, input, "Failed to generate lesson plan.");
}

export async function generateDiscussionAction(input: GenerateDiscussionInput) {
  return runAction(generateDiscussion, input, "Failed to generate discussion materials.");
}

export async function generateVisualAidAction(input: GenerateVisualAidInput) {
    return runAction(generateVisualAid, input, "Failed to generate visual aid.");
}

export async function askSahayakAction(input: AskSahayakInput) {
    return runAction(askSahayak, input, "Failed to get an answer from Sahayak.");
}

export async function getTtsVoicesAction(languageCode: string) {
    try {
        const result = await getTtsVoices(languageCode);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to get TTS voices.";
        return { success: false, error: message };
    }
}

export async function createPresentationAction(input: CreatePresentationInput) {
    return runAction(createPresentation, input, "Failed to generate presentation.");
}

export async function professionalDevelopmentAction(input: ProfessionalDevelopmentInput) {
    return runAction(getProfessionalDevelopmentPlan, input, "Failed to generate professional development plan.");
}

export async function appChatbotAction(input: AppChatbotInput) {
    return runAction(appChatbot, input, "Failed to get a response from the chatbot.");
}

export async function createWorksheetAction(input: CreateWorksheetInput) {
  return runAction(createWorksheet, input, "Failed to create worksheet.");
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
