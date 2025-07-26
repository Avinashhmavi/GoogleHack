
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeFirebaseAdmin } from "./firebase-admin";

export type Student = {
  id: string;
  uid: string;
  name: string;
  photoDataUri: string; // A data URI for the student's photo
};

export type GradeEntry = {
  id: string;
  uid: string;
  studentName: string;
  subject: string;
  grade: number;
  className: string;
  date: Date;
  createdAt?: Date;
};

export type CalendarEvent = {
  id: string;
  uid: string;
  date: Timestamp | Date; // Use Timestamp for Firestore, Date for client
  title: string;
  type: "Lesson" | "Deadline" | "Event" | "Holiday";
};

export type ClassRecording = {
    id: string;
    uid: string;
    name: string;
    dataUrl: string; // This could be a data URI or a GCS URL
    createdAt: Timestamp;
}

async function getDb() {
    await initializeFirebaseAdmin();
    return getFirestore();
}

export const studentRosterDb = {
  getStudents: async (uid: string): Promise<Student[]> => {
    const db = await getDb();
    const studentsRef = db.collection('users').doc(uid).collection('students');
    const snapshot = await studentsRef.orderBy('name').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid,
        name: data.name,
        photoDataUri: data.photoDataUri,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      };
    });
  },

  addStudent: async (uid: string, student: Omit<Student, 'id' | 'uid'>): Promise<void> => {
    if (!student.name || !student.photoDataUri) {
      throw new Error("Student name and photo are required.");
    }
    const db = await getDb();
    const newStudentRef = db.collection('users').doc(uid).collection('students').doc();
    await newStudentRef.set({
        uid,
        name: student.name,
        photoDataUri: student.photoDataUri,
        createdAt: FieldValue.serverTimestamp()
    });
  },
  
  deleteStudent: async (uid: string, id: string): Promise<void> => {
    const db = await getDb();
    const studentRef = db.collection('users').doc(uid).collection('students').doc(id);
    const doc = await studentRef.get();

    if (!doc.exists) {
      throw new Error("Student not found.");
    }
    await studentRef.delete();
  },
};


export const gradesDb = {
    getGrades: async (uid: string): Promise<GradeEntry[]> => {
        const db = await getDb();
        const gradesRef = db.collection('users').doc(uid).collection('grades');
        const snapshot = await gradesRef.orderBy('className').orderBy('studentName').get();
        if(snapshot.empty) return [];
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: data.uid,
                studentName: data.studentName,
                subject: data.subject,
                grade: data.grade,
                className: data.className,
                date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            };
        });
    },
    addGrade: async (uid: string, grade: Omit<GradeEntry, 'id' | 'uid'>): Promise<void> => {
        const db = await getDb();
        
        // Check if a grade already exists for this student, subject, and date
        const existingGradesRef = db.collection('users').doc(uid).collection('grades');
        const existingSnapshot = await existingGradesRef
            .where('studentName', '==', grade.studentName)
            .where('subject', '==', grade.subject)
            .where('date', '==', grade.date)
            .get();
        
        if (!existingSnapshot.empty) {
            // Update existing grade
            const existingDoc = existingSnapshot.docs[0];
            await existingDoc.ref.update({
                grade: grade.grade,
                className: grade.className,
                createdAt: FieldValue.serverTimestamp()
            });
        } else {
            // Add new grade
            const newGradeRef = existingGradesRef.doc();
            await newGradeRef.set({ uid, ...grade, createdAt: FieldValue.serverTimestamp() });
        }
    },
    deleteGrade: async (uid: string, id: string): Promise<void> => {
        const db = await getDb();
        await db.collection('users').doc(uid).collection('grades').doc(id).delete();
    }
}

export const calendarDb = {
    getEvents: async (uid: string): Promise<CalendarEvent[]> => {
        const db = await getDb();
        const eventsRef = db.collection('users').doc(uid).collection('calendarEvents');
        const snapshot = await eventsRef.orderBy('date').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: data.uid,
                date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
                title: data.title,
                type: data.type,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            };
        });
    },
    addEvent: async (uid: string, event: Omit<CalendarEvent, 'id' | 'uid'>): Promise<void> => {
        const db = await getDb();
        const newEventRef = db.collection('users').doc(uid).collection('calendarEvents').doc();
        await newEventRef.set({ uid, ...event, createdAt: FieldValue.serverTimestamp() });
    },
    deleteEvent: async (uid: string, id: string): Promise<void> => {
        const db = await getDb();
        await db.collection('users').doc(uid).collection('calendarEvents').doc(id).delete();
    }
}

export const recordingsDb = {
    getRecordings: async (uid: string): Promise<ClassRecording[]> => {
        const db = await getDb();
        const recordingsRef = db.collection('users').doc(uid).collection('recordings');
        const snapshot = await recordingsRef.orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassRecording));
    },
    addRecording: async (uid: string, recording: Omit<ClassRecording, 'id' | 'uid' | 'createdAt'>): Promise<void> => {
        const db = await getDb();
        const newRecordingRef = db.collection('users').doc(uid).collection('recordings').doc();
        await newRecordingRef.set({ uid, ...recording, createdAt: FieldValue.serverTimestamp() });
    },
    deleteRecording: async (uid: string, id: string): Promise<void> => {
        const db = await getDb();
        await db.collection('users').doc(uid).collection('recordings').doc(id).delete();
    }
}
