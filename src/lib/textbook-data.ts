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
                // Extract chapter number from title and format as "Chapter X"
                const chapterMatch = pdf.title.match(/Chapter (\d+)/);
                const chapterNumber = chapterMatch ? chapterMatch[1] : '1';
                const formattedTitle = `Chapter ${chapterNumber}`;
                
                books.push({
                    id: id++,
                    title: formattedTitle,
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
