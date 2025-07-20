
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
import { searchYoutubeVideos } from "@/ai/flows/search-youtube-videos";
import type { SearchYoutubeVideosInput } from "@/ai/flows/search-youtube-videos.types";
import { createMentorshipPlan } from "@/ai/flows/create-mentorship-plan";
import type { CreateMentorshipPlanInput } from "@/ai/flows/create-mentorship-plan.types";

import { studentRosterDb, type Student, gradesDb, type GradeEntry, calendarDb, type CalendarEvent, recordingsDb, type ClassRecording } from "@/lib/firestore";
import { getAuthenticatedUser } from "./auth";


// Wrapper function to handle Genkit flow execution and error handling
export async function runAction<I, O>(action: (input: I) => Promise<O>, input: I, errorMsg: string): Promise<{ success: true, data: O } | { success: false, error: string }> {
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
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(adaptContentGradeLevel, input, "Failed to adapt content.");
}

export async function generateQrCodeAction(input: GenerateAnswerKeyQrCodeInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(generateAnswerKeyQrCode, input, "Failed to generate QR code.");
}

export async function generateLocalizedContentAction(
  input: GenerateLocalizedContentInput
) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(generateLocalizedContent, input, "Failed to generate content.");
}

export async function photoToWorksheetAction(input: PhotoToWorksheetInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(photoToWorksheet, input, "Failed to generate worksheet.");
}

export async function generateQuizAction(input: GenerateQuizInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(generateQuiz, input, "Failed to generate quiz.");
}

export async function createRubricAction(input: CreateRubricInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(createRubric, input, "Failed to create rubric.");
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(textToSpeech, input, "Failed to convert text to speech.");
}

export async function enhanceWritingAction(input: EnhanceWritingInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(enhanceWriting, input, "Failed to enhance writing.");
}

export async function recognizeStudentsAction(input: RecognizeStudentsInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  
  const studentRoster = await studentRosterDb.getStudents(user.uid);
  const flowInput = { ...input, studentRoster };

  return runAction(recognizeStudents, flowInput, "Failed to recognize students.");
}

export async function createLessonPlanAction(input: CreateLessonPlanInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(createLessonPlan, input, "Failed to generate lesson plan.");
}

export async function generateDiscussionAction(input: GenerateDiscussionInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(generateDiscussion, input, "Failed to generate discussion materials.");
}

export async function generateVisualAidAction(input: GenerateVisualAidInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(generateVisualAid, input, "Failed to generate visual aid.");
}

export async function askSahayakAction(input: AskSahayakInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(askSahayak, input, "Failed to get an answer from Sahayak.");
}

export async function getTtsVoicesAction(languageCode: string) {
    try {
        await getAuthenticatedUser();
        const result = await getTtsVoices(languageCode);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to get TTS voices.";
        return { success: false, error: message };
    }
}

export async function createPresentationAction(input: CreatePresentationInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(createPresentation, input, "Failed to generate presentation.");
}

export async function professionalDevelopmentAction(input: ProfessionalDevelopmentInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(getProfessionalDevelopmentPlan, input, "Failed to generate professional development plan.");
}

export async function appChatbotAction(input: Omit<AppChatbotInput, 'studentRoster'>) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    let studentRoster: Student[] = [];
    if (user) {
        studentRoster = await studentRosterDb.getStudents(user.uid);
    }
    const enrichedInput = { ...input, studentRoster };
    return runAction(appChatbot, enrichedInput, "Failed to get a response from the chatbot.");
}

export async function createWorksheetAction(input: CreateWorksheetInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(createWorksheet, input, "Failed to create worksheet.");
}

export async function searchYoutubeVideosAction(input: SearchYoutubeVideosInput) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "User not authenticated." };
  return runAction(searchYoutubeVideos, input, "Failed to search for YouTube videos.");
}

export async function createMentorshipPlanAction(input: CreateMentorshipPlanInput) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "User not authenticated." };
    return runAction(createMentorshipPlan, input, "Failed to create mentorship plan.");
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
export async function getCalendarEventsAction(token: string | null) {
    const user = await getAuthenticatedUser(token);
    if (!user) return { success: false, error: "User not authenticated." };
    try {
        const events = await calendarDb.getEvents(user.uid);
        return { success: true, data: events };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get events.";
        return { success: false, error: message };
    }
}

export async function addCalendarEventAction(token: string | null, event: Omit<CalendarEvent, 'id' | 'uid'>) {
    const user = await getAuthenticatedUser(token);
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

export async function deleteCalendarEventAction(token: string | null, id: string) {
    const user = await getAuthenticatedUser(token);
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

export async function addRecordingAction(recording: Omit<ClassRecording, 'id' | 'uid'>) {
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
