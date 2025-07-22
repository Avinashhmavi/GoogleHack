import gradeWiseData from '../../grade_wise_subjects_pdf.json';

export type Textbook = {
    id: number;
    title: string;
    grade: string;
    subject: string;
    coverImageUrl: string;
    pdfUrl: string;
};

// Generate a flat array of Textbook objects from the JSON
export const textbookData: Textbook[] = (() => {
    let id = 1;
    const books: Textbook[] = [];
    for (const gradeObj of gradeWiseData.grades) {
        const grade = gradeObj.grade;
        for (const subjectObj of gradeObj.subjects) {
            const subject = subjectObj.subject_name;
            for (const pdf of subjectObj.pdf_links) {
                books.push({
                    id: id++,
                    title: pdf.title,
                    grade,
                    subject,
                    coverImageUrl: 'https://placehold.co/300x400.png', // Placeholder, can be improved
                    pdfUrl: pdf.url,
                });
            }
        }
    }
    return books;
})();
