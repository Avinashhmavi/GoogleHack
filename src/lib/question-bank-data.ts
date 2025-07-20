
export type QuestionBank = {
    id: number;
    title: string;
    grade: string;
    subject: string;
    coverImageUrl: string;
    pdfUrl: string;
};

// NOTE: Using publicly available, Creative Commons, or open-source materials.
// Replace with actual licensed content for a real application.
export const questionBankData: QuestionBank[] = [
    // Grade 6
    { id: 1, title: "Grade 6 Science Questions", grade: "6", subject: "Science", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.ccboe.net/site/handlers/filedownload.ashx?moduleinstanceid=4328&dataid=17387&FileName=6th%20Grade%20Science%20Final%20Exam%20Study%20Guide.pdf" },
    { id: 2, title: "Grade 6 Math Problems", grade: "6", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.effortlessmath.com/wp-content/uploads/2021/05/6th-Grade-Common-Core-Math-Workbook-The-Most-Comprehensive-Review-for-the-Common-Core-State-Standards.pdf" },
    
    // Grade 8
    { id: 3, title: "Grade 8 History Questions", grade: "8", subject: "History", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.nps.gov/common/uploads/teachers/lesson_plans/Amistad%208th%20Grade%20Pre-Test%20and%20Post-Test%20Questions%20and%20Answer%20Key.pdf" },
    { id: 4, title: "Grade 8 Pre-Algebra", grade: "8", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.cnusd.k12.ca.us/cms/lib/CA01001152/Centricity/Domain/3932/Ch%201%20and%202%20Practice.pdf" },

    // Grade 10
    { id: 5, title: "Grade 10 Physics Problems", grade: "10", subject: "Physics", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.sps.org/site/handlers/filedownload.ashx?moduleinstanceid=931&dataid=660&FileName=IGCSE%20Physics%20Worksheet%201-Measurement.pdf" },
    { id: 6, title: "Grade 10 Chemistry Questions", grade: "10", subject: "Chemistry", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.sthelens.org.uk/wp-content/uploads/2020/06/Chemistry-Transition-Booklet-2020.pdf" },

    // Grade 12
    { id: 7, title: "Calculus Question Bank", grade: "12", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://math.mit.edu/~djk/18_01/chapter01/problems.pdf" },
    { id: 8, title: "Advanced Physics Questions", grade: "12", subject: "Physics", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.a-levelphysicstutor.com/images/worksheets/free/circ-w.pdf" }
];
