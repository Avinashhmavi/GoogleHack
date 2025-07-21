
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
import type { RecognizeStudentsInputWithRoster } from "@/ai/flows/recognize-students.types";
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
import { searchYoutubeVideos } from "@/ai/flows/search-youtube-videos";
import type { SearchYoutubeVideosInput } from "@/ai/flows/search-youtube-videos.types";
import { createMentorshipPlan } from "@/ai/flows/create-mentorship-plan";
import type { CreateMentorshipPlanInput } from "@/ai/flows/create-mentorship-plan.types";

import { studentRosterDb, type Student, gradesDb, type GradeEntry, calendarDb, type CalendarEvent, recordingsDb, type ClassRecording } from "@/lib/firestore";
import { getAuthenticatedUser } from "./auth";


// Wrapper function to handle Genkit flow execution and error handling
async function runAction<I, O>(action: (input: I) => Promise<O>, input: I): Promise<{ success: true, data: O } | { success: false, error: string }> {
    try {
        const result = await action(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: message };
    }
}


export async function adaptContentAction(input: AdaptContentGradeLevelInput) {
  return runAction(adaptContentGradeLevel, input);
}

export async function generateQrCodeAction(input: GenerateAnswerKeyQrCodeInput) {
  return runAction(generateAnswerKeyQrCode, input);
}

export async function generateLocalizedContentAction(
  input: GenerateLocalizedContentInput
) {
  return runAction(generateLocalizedContent, input);
}

export async function photoToWorksheetAction(input: PhotoToWorksheetInput) {
  return runAction(photoToWorksheet, input);
}

export async function generateQuizAction(input: GenerateQuizInput) {
  return runAction(generateQuiz, input);
}

export async function createRubricAction(input: CreateRubricInput) {
    return runAction(createRubric, input);
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    return runAction(textToSpeech, input);
}

export async function enhanceWritingAction(input: EnhanceWritingInput) {
  return runAction(enhanceWriting, input);
}

export async function recognizeStudentsAction(input: {photoDataUri: string}) {  
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  
  const studentRoster = await studentRosterDb.getStudents(user.uid);
  const flowInput: RecognizeStudentsInputWithRoster = { ...input, studentRoster };

  return runAction(recognizeStudents, flowInput);
}

export async function createLessonPlanAction(input: CreateLessonPlanInput) {
  return runAction(createLessonPlan, input);
}

export async function generateDiscussionAction(input: GenerateDiscussionInput) {
  return runAction(generateDiscussion, input);
}

export async function generateVisualAidAction(input: GenerateVisualAidInput) {
    return runAction(generateVisualAid, input);
}

export async function askSahayakAction(input: AskSahayakInput) {
    return runAction(askSahayak, input);
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
    return runAction(createPresentation, input);
}

export async function professionalDevelopmentAction(input: ProfessionalDevelopmentInput) {
    return runAction(getProfessionalDevelopmentPlan, input);
}

export async function appChatbotAction(input: Omit<AppChatbotInput, 'studentRoster'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    let studentRoster: Student[] = [];
    if (user) {
        studentRoster = await studentRosterDb.getStudents(user.uid);
    }
    const enrichedInput = { ...input, studentRoster };
    return runAction(appChatbot, enrichedInput);
}

export async function createWorksheetAction(input: CreateWorksheetInput) {
  return runAction(createWorksheet, input);
}

export async function searchYoutubeVideosAction(input: SearchYoutubeVideosInput) {
  return runAction(searchYoutubeVideos, input);
}

export async function createMentorshipPlanAction(input: CreateMentorshipPlanInput) {
    return runAction(createMentorshipPlan, input);
}


// Student Roster Actions
export async function getStudentsAction() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        const students = await studentRosterDb.getStudents(user.uid);
        return { success: true, data: students };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get students.";
        return { success: false, error: message };
    }
}

export async function addStudentAction(student: Omit<Student, 'id' | 'uid'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await studentRosterDb.addStudent(user.uid, student);
        const students = await studentRosterDb.getStudents(user.uid);
        return { success: true, data: students };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add student.";
        return { success: false, error: message };
    }
}

export async function deleteStudentAction(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await studentRosterDb.deleteStudent(user.uid, id);
        const students = await studentRosterDb.getStudents(user.uid);
        return { success: true, data: students };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete student.";
        return { success: false, error: message };
    }
}


// Grade Tracking Actions
export async function getGradesAction() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        const grades = await gradesDb.getGrades(user.uid);
        return { success: true, data: grades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get grades.";
        return { success: false, error: message };
    }
}

export async function addGradeAction(grade: Omit<GradeEntry, 'id' | 'uid'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await gradesDb.addGrade(user.uid, grade);
        const grades = await gradesDb.getGrades(user.uid);
        return { success: true, data: grades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add grade.";
        return { success: false, error: message };
    }
}

export async function deleteGradeAction(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await gradesDb.deleteGrade(user.uid, id);
        const grades = await gradesDb.getGrades(user.uid);
        return { success: true, data: grades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete grade.";
        return { success: false, error: message };
    }
}

// Calendar Event Actions
export async function getCalendarEventsAction() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        const events = await calendarDb.getEvents(user.uid);
        return { success: true, data: events };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get events.";
        return { success: false, error: message };
    }
}

export async function addCalendarEventAction(event: Omit<CalendarEvent, 'id' | 'uid'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await calendarDb.addEvent(user.uid, event);
        const events = await calendarDb.getEvents(user.uid);
        return { success: true, data: events };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add event.";
        return { success: false, error: message };
    }
}

export async function deleteCalendarEventAction(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await calendarDb.deleteEvent(user.uid, id);
        const events = await calendarDb.getEvents(user.uid);
        return { success: true, data: events };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete event.";
        return { success: false, error: message };
    }
}


// Class Recordings Actions
export async function getRecordingsAction() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        const recordings = await recordingsDb.getRecordings(user.uid);
        return { success: true, data: recordings };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get recordings.";
        return { success: false, error: message };
    }
}

export async function addRecordingAction(recording: Omit<ClassRecording, 'id' | 'uid' | 'createdAt'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await recordingsDb.addRecording(user.uid, recording);
        const recordings = await recordingsDb.getRecordings(user.uid);
        return { success: true, data: recordings };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add recording.";
        return { success: false, error: message };
    }
}

export async function deleteRecordingAction(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        await recordingsDb.deleteRecording(user.uid, id);
        const recordings = await recordingsDb.getRecordings(user.uid);
        return { success: true, data: recordings };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete recording.";
        return { success: false, error: message };
    }
}
