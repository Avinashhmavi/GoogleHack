
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

import { studentRosterDb, type Student, gradesDb, type GradeEntry, recordingsDb, type ClassRecording } from "@/lib/firestore";
import { getLocalCalendarEvents, addLocalCalendarEvent, deleteLocalCalendarEvent } from "@/lib/calendar-data";
import type { LocalCalendarEvent } from "@/lib/local-data";
type CalendarEvent = LocalCalendarEvent;
import { getAuthenticatedUser } from "./auth";
import { 
  getLocalStudents, 
  addLocalGrade, 
  deleteLocalGrade, 
  getLocalGrades,
  type LocalStudent
} from "@/lib/local-data";

// Cache for student photo data URIs
const studentPhotoCache = new Map<string, string>();

// Cache for student data
let studentDataCache: any[] | null = null;
let studentDataCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to clear all caches
export async function clearAllCaches() {
  studentPhotoCache.clear();
  studentDataCache = null;
  studentDataCacheTimestamp = null;
}


// Wrapper function to handle Genkit flow execution and error handling
async function runAction<I, O>(action: (input: I) => Promise<O>, input: I): Promise<{ success: true, data: O } | { success: false, error: string }> {
    try {
        // Add a small delay to allow UI to update before starting the action
        // This helps with perceived performance
        await new Promise(resolve => setTimeout(resolve, 0));
        
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

// Process students in batches to improve performance
const BATCH_SIZE = 20;

async function processStudentsInBatches(
  localStudents: LocalStudent[], 
  photoDataUri: string
): Promise<{ success: true; data: { presentStudents: string[] } } | { success: false; error: string }> {
  let allPresentStudents: string[] = [];
  
  // Process students in batches
  for (let i = 0; i < localStudents.length; i += BATCH_SIZE) {
    const batch = localStudents.slice(i, i + BATCH_SIZE);
    
    // Convert LocalStudent to Student format for compatibility
    // and convert file paths to proper data URIs with content type
    const studentRoster = await Promise.all(batch.map(async student => {
        // Check if we have a cached version of the photo data URI
        const cachedPhotoDataUri = studentPhotoCache.get(student.rollno);
        if (cachedPhotoDataUri) {
            return {
                id: student.rollno,
                uid: "local",
                name: student.name,
                photoDataUri: cachedPhotoDataUri
            };
        }
        
        // Extract file extension to determine content type
        const fileExtension = student.profile_photo.split('.').pop()?.toLowerCase();
        let contentType = 'image/jpeg';
        if (fileExtension === 'png') {
            contentType = 'image/png';
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
            contentType = 'image/jpeg';
        }
        
        // Convert file to data URI with Base64 encoding
        const fs = require('fs');
        const path = require('path');
        let filePath = path.join(process.cwd(), 'student details', student.profile_photo);
        
        // Check if file exists, if not use placeholder
        if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), 'student details', 'images', 'students', 'placeholder.png');
            // Update content type for placeholder
            contentType = 'image/png';
        }
        
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const photoDataUri = `data:${contentType};base64,${base64Data}`;
        
        // Cache the photo data URI for future use
        studentPhotoCache.set(student.rollno, photoDataUri);
        
        return {
            id: student.rollno,
            uid: "local",
            name: student.name,
            photoDataUri
        };
    }));
    
    const flowInput: RecognizeStudentsInputWithRoster = { photoDataUri, studentRoster };
    const batchResult = await runAction(recognizeStudents, flowInput);
    
    if (batchResult.success) {
      allPresentStudents = [...allPresentStudents, ...batchResult.data.presentStudents];
    } else {
      // If any batch fails, return the error
      return { success: false, error: batchResult.error };
    }
  }
  
  // Remove duplicates (in case a student appears in multiple batches)
  const uniquePresentStudents = [...new Set(allPresentStudents)];
  
  return { success: true, data: { presentStudents: uniquePresentStudents } };
}

export async function recognizeStudentsAction(input: {photoDataUri: string}) {  
  try {
    // Use local student data instead of Firestore
    const localStudents = await getLocalStudents();
    
    // Process students in batches for better performance
    return await processStudentsInBatches(localStudents, input.photoDataUri);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to recognize students.";
    return { success: false, error: message };
  }
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

export async function appChatbotAction(input: AppChatbotInput) {
    const enrichedInput = { ...input, studentRoster: [] };
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
    try {
        // Check if we have valid cached data
        const now = Date.now();
        if (studentDataCache && studentDataCacheTimestamp && (now - studentDataCacheTimestamp) < CACHE_DURATION) {
            return { success: true, data: studentDataCache };
        }

        // Use local student data instead of Firestore
        const students = await getLocalStudents();
        // Convert LocalStudent to Student format for compatibility
        // and convert file paths to proper data URIs with content type
        const formattedStudents = await Promise.all(students.map(async student => {
            // Check if we have a cached version of the photo data URI
            const cachedPhotoDataUri = studentPhotoCache.get(student.rollno);
            if (cachedPhotoDataUri) {
                return {
                    id: student.rollno,
                    uid: "local",
                    name: student.name,
                    photoDataUri: cachedPhotoDataUri
                };
            }

            // Extract file extension to determine content type
            const fileExtension = student.profile_photo.split('.').pop()?.toLowerCase();
            let contentType = 'image/jpeg';
            if (fileExtension === 'png') {
                contentType = 'image/png';
            } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
                contentType = 'image/jpeg';
            }
            
            // Convert file to data URI with Base64 encoding
            const fs = require('fs');
            const path = require('path');
            let filePath = path.join(process.cwd(), 'student details', student.profile_photo);
            
            // Check if file exists, if not use placeholder
            if (!fs.existsSync(filePath)) {
                filePath = path.join(process.cwd(), 'student details', 'images', 'students', 'placeholder.png');
                // Update content type for placeholder
                contentType = 'image/png';
            }
            
            const fileBuffer = fs.readFileSync(filePath);
            const base64Data = fileBuffer.toString('base64');
            const photoDataUri = `data:${contentType};base64,${base64Data}`;
            
            // Cache the photo data URI for future use
            studentPhotoCache.set(student.rollno, photoDataUri);
            
            return {
                id: student.rollno,
                uid: "local",
                name: student.name,
                photoDataUri
            };
        }));

        // Cache the formatted students data
        studentDataCache = formattedStudents;
        studentDataCacheTimestamp = now;

        return { success: true, data: formattedStudents };
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
    try {
        // Use local grade data instead of Firestore
        const grades = await getLocalGrades();
        return { success: true, data: grades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get grades.";
        return { success: false, error: message };
    }
}

export async function addGradeAction(grade: Omit<GradeEntry, 'id' | 'uid'>) {
    try {
        // Use local grade data instead of Firestore
        const newGrades = await addLocalGrade(grade);
        return { success: true, data: newGrades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add grade.";
        return { success: false, error: message };
    }
}

export async function deleteGradeAction(id: string) {
    try {
        // Use local grade data instead of Firestore
        const newGrades = await deleteLocalGrade(id);
        return { success: true, data: newGrades };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete grade.";
        return { success: false, error: message };
    }
}

// Calendar Event Actions
export async function getCalendarEventsAction() {
    try {
        // Use local calendar data instead of Firestore
        const events = await getLocalCalendarEvents();
        return { success: true, data: events };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get events.";
        return { success: false, error: message };
    }
}

export async function addCalendarEventAction(event: Omit<CalendarEvent, 'id'>) {
    try {
        // Use local calendar data instead of Firestore
        const newEvents = await addLocalCalendarEvent(event);
        return { success: true, data: newEvents };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add event.";
        return { success: false, error: message };
    }
}

export async function deleteCalendarEventAction(id: string) {
    try {
        // Use local calendar data instead of Firestore
        const newEvents = await deleteLocalCalendarEvent(id);
        return { success: true, data: newEvents };
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
