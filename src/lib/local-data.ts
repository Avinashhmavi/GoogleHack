import studentsData from "../../student details/students_data.json";

export type LocalStudent = {
  rollno: string;
  name: string;
  grade: string;
  profile_photo: string;
};

export type LocalGradeEntry = {
  id: string;
  studentName: string;
  subject: string;
  grade: number;
  className: string;
};

export type LocalCalendarEvent = {
  id: string;
  date: Date;
  title: string;
  type: "Lesson" | "Deadline" | "Event" | "Holiday";
};

export type LocalClassRecording = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: Date;
};

// In-memory storage for grades, events, and recordings
let localGrades: LocalGradeEntry[] = [];
let localEvents: LocalCalendarEvent[] = [];
let localRecordings: LocalClassRecording[] = [];

// Student data from JSON file
export const getLocalStudents = async (): Promise<LocalStudent[]> => {
  return studentsData.students;
};

// Grade tracking functions
export const getLocalGrades = async (): Promise<LocalGradeEntry[]> => {
  return localGrades;
};

export const addLocalGrade = async (grade: Omit<LocalGradeEntry, 'id'>): Promise<LocalGradeEntry[]> => {
  const newGrade: LocalGradeEntry = {
    ...grade,
    id: Math.random().toString(36).substring(2, 9)
  };
  localGrades = [...localGrades, newGrade];
  return localGrades;
};

export const deleteLocalGrade = async (id: string): Promise<LocalGradeEntry[]> => {
  localGrades = localGrades.filter(grade => grade.id !== id);
  return localGrades;
};

// Calendar event functions
export const getLocalEvents = async (): Promise<LocalCalendarEvent[]> => {
  return localEvents;
};

export const addLocalEvent = async (event: Omit<LocalCalendarEvent, 'id'>): Promise<LocalCalendarEvent[]> => {
  const newEvent: LocalCalendarEvent = {
    ...event,
    id: Math.random().toString(36).substring(2, 9)
  };
  localEvents = [...localEvents, newEvent];
  return localEvents;
};

export const deleteLocalEvent = async (id: string): Promise<LocalCalendarEvent[]> => {
  localEvents = localEvents.filter(event => event.id !== id);
  return localEvents;
};

// Class recording functions
export const getLocalRecordings = async (): Promise<LocalClassRecording[]> => {
  return localRecordings;
};

export const addLocalRecording = async (recording: Omit<LocalClassRecording, 'id' | 'createdAt'>): Promise<LocalClassRecording[]> => {
  const newRecording: LocalClassRecording = {
    ...recording,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date()
  };
  localRecordings = [...localRecordings, newRecording];
  return localRecordings;
};

export const deleteLocalRecording = async (id: string): Promise<LocalClassRecording[]> => {
  localRecordings = localRecordings.filter(recording => recording.id !== id);
  return localRecordings;
};
