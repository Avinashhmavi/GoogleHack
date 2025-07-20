
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initializeFirebaseAdmin } from "./firebase-admin";

export type Student = {
  id: string;
  uid: string;
  name: string;
  photoDataUri: string; // A data URI for the student's photo
};

async function getDb() {
    await initializeFirebaseAdmin();
    return getFirestore();
}

export const studentRoster = {
  getStudents: async (uid: string): Promise<Student[]> => {
    const db = await getDb();
    const studentsRef = db.collection('users').doc(uid).collection('students');
    const snapshot = await studentsRef.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
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
