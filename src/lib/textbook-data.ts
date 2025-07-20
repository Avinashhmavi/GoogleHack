
export type Textbook = {
    id: number;
    title: string;
    grade: string;
    subject: string;
    coverImageUrl: string;
    pdfUrl: string;
};

// NOTE: Using publicly available, Creative Commons, or open-source textbooks.
// Replace with actual licensed content for a real application.
export const textbookData: Textbook[] = [
    // Grade 1
    { id: 1, title: "My First Math Book", grade: "1", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.graniteschools.org/mathvocabulary/wp-content/uploads/2018/07/1st-Grade-Student-Glossary.pdf", },
    { id: 2, title: "Fun with Phonics", grade: "1", subject: "English", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.memoriapress.com/wp-content/uploads/2021/02/First-Start-Reading-Phonics-Sample.pdf", },
    
    // Grade 3
    { id: 3, title: "Multiplication & Division", grade: "3", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.houstonisd.org/cms/lib2/TX01001591/Centricity/Domain/53545/M_GR3_P_3_02_C3_S3_Multiplicati.pdf" },
    { id: 4, title: "Our Solar System", grade: "3", subject: "Science", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.mohave.gov/Content/documents/community/8.%203rd%20Grade_Solar%20System_What%20Is%20A%20Solar%20System.pdf" },
    
    // Grade 5
    { id: 5, title: "American History: The Colonies", grade: "5", subject: "History", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.montgomeryschoolsmd.org/uploadedFiles/schools/greencastle-es/grade-level-teams/Grade%205/SS/Ch_4_The_New_England_Colonies.pdf" },
    { id: 6, title: "Fractions & Decimals", grade: "5", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.monroe.k12.nj.us/cms/lib/NJ01000268/Centricity/Domain/629/Math-Grade_5-Parent-Guide.pdf" },
    
    // Grade 7
    { id: 7, title: "Introduction to Life Science", grade: "7", subject: "Science", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.lcsnc.org/cms/lib/NC01911169/Centricity/Domain/2521/Life%20Science%20Textbook.pdf" },
    { id: 8, title: "Pre-Algebra", grade: "7", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://math.libretexts.org/@api/deki/files/16383/Prealgebra_1e_Full_Book.pdf?revision=1" },
    
    // Grade 9
    { id: 9, title: "Introductory Chemistry", grade: "9", subject: "Chemistry", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.sjsu.edu/chemistry/docs/undergrad/Introductory%20Chemistry.pdf" },
    { id: 10, title: "Algebra I", grade: "9", subject: "Math", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://math.libretexts.org/@api/deki/files/32616/Beginning_and_Intermediate_Algebra.pdf?revision=1" },

    // Grade 11
    { id: 11, title: "U.S. History", grade: "11", subject: "History", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://d3bxy9euw4e147.cloudfront.net/oscms-dev/media/documents/USHistory-OP_S35c8sL.pdf" },
    { id: 12, title: "Principles of Physics", grade: "11", subject: "Physics", coverImageUrl: "https://placehold.co/300x400.png", pdfUrl: "https://www.st-andrews.ac.uk/~www_pa/Scots_Guide/info/signals/books/Princ_of_phys.pdf" },
];
