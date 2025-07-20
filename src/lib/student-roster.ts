// This is a mock database for student roster management.
// In a real application, you would replace this with a proper database like Firestore.

export type Student = {
  id: string;
  name: string;
  photoDataUri: string; // A data URI for the student's photo
};

// Initial empty roster
let students: Student[] = [];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export const studentRoster = {
  getStudents: (): Student[] => {
    // Return a copy to prevent direct mutation
    return [...students];
  },

  addStudent: (student: Omit<Student, 'id'>): void => {
    if (!student.name || !student.photoDataUri) {
      throw new Error("Student name and photo are required.");
    }
    const newStudent: Student = {
      id: generateId(),
      ...student,
    };
    students.push(newStudent);
  },
  
  deleteStudent: (id: string): void => {
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error("Student not found.");
    }
    students.splice(index, 1);
  },
};
