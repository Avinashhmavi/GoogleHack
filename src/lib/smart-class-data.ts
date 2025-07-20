
export type Video = {
    id: number;
    title: string;
    grade: string;
    subject: string;
    youtubeId: string;
};

export const videoData: Video[] = [
    // Grade 1
    { id: 1, title: "Phonics Song with TWO Words", grade: "1", subject: "English", youtubeId: "hB0pYfSJUa4" },
    { id: 2, title: "Learn to Add and Subtract", grade: "1", subject: "Math", youtubeId: "ZrP_p_P9kYI" },
    { id: 3, title: "The 5 Senses for Kids", grade: "1", subject: "Science", youtubeId: "LhI2P2eO7I0" },
    { id: 4, title: "Learn About Community Helpers", grade: "1", subject: "History", youtubeId: "btR18fAg4tQ" },
    { id: 5, title: "Shapes for Kids", grade: "1", subject: "Math", youtubeId: "OE_T1c0o99o" },

    // Grade 2
    { id: 6, title: "Nouns, Verbs, Adjectives for Kids", grade: "2", subject: "English", youtubeId: "C2n6y2cr-Yg" },
    { id: 7, title: "Place Value for Kids: Ones, Tens, Hundreds", grade: "2", subject: "Math", youtubeId: "1F3A_kQpDvw" },
    { id: 8, title: "The Life Cycle of a Butterfly", grade: "2", subject: "Science", youtubeId: "O1S8WzwLPlM" },
    { id: 9, title: "Continents and Oceans", grade: "2", subject: "History", youtubeId: "K6DSMZ8b3LE" },
    { id: 10, title: "Telling Time For Children", grade: "2", subject: "Math", youtubeId: "HrxZWNu72WI" },

    // Grade 3
    { id: 11, title: "Introduction to Multiplication", grade: "3", subject: "Math", youtubeId: "g0qI-12o-Xo" },
    { id: 12, title: "What is a Sentence? for Kids", grade: "3", subject: "English", youtubeId: "r2figEvmyO4" },
    { id: 13, title: "The Water Cycle", grade: "3", subject: "Science", youtubeId: "s0bS-SBAgJI" },
    { id: 14, title: "Ancient Egypt for Kids", grade: "3", subject: "History", youtubeId: "KdtgX9ORiW4" },
    { id: 15, title: "Basic Division for Kids", grade: "3", subject: "Math", youtubeId: "f14G5-JpM-8" },
    { id: 16, title: "Types of Rocks", grade: "3", subject: "Science", youtubeId: "KLSpx2m2p-U" },

    // Grade 4
    { id: 17, title: "Fractions for Kids", grade: "4", subject: "Math", youtubeId: "p33BYf1NDAE" },
    { id: 18, title: "Types of Sentences", grade: "4", subject: "English", youtubeId: "t2T4_Alx3kI" },
    { id: 19, title: "Photosynthesis: A Simple Explanation", grade: "4", subject: "Science", youtubeId: "D1Ymc31__xM" },
    { id: 20, title: "The Roman Empire for Kids", grade: "4", subject: "History", youtubeId: "b9bU-kG_Y4U" },
    { id: 21, title: "Area and Perimeter", grade: "4", subject: "Math", youtubeId: "rSVMrPu0__U" },
    { id: 22, title: "Electricity for Kids", grade: "4", subject: "Science", youtubeId: "344OpaQeG0I" },

    // Grade 5
    { id: 23, title: "Order of Operations (PEMDAS)", grade: "5", subject: "Math", youtubeId: "ZzeDWFhYv3E" },
    { id: 24, title: "Figurative Language for Kids", grade: "5", subject: "English", youtubeId: "uWHeK8sB-6I" },
    { id: 25, title: "The Human Digestive System", grade: "5", subject: "Science", youtubeId: "VwrsL-lCZ_E" },
    { id: 26, title: "The American Revolution for Kids", grade: "5", subject: "History", youtubeId: "HlUiSBXQHCg" },
    { id: 27, title: "Decimals Introduction", grade: "5", subject: "Math", youtubeId: "M31i5_s7DE8" },
    { id: 28, title: "Food Chains for Kids", grade: "5", subject: "Science", youtubeId: "2lqhJNgn_lc" },
    { id: 29, title: "The Thirteen Colonies", grade: "5", subject: "History", youtubeId: "vd0fMpAIs1s" },

    // Grade 6
    { id: 30, title: "What is an Integer?", grade: "6", subject: "Math", youtubeId: "eaG1F_q4gD0" },
    { id: 31, title: "Ancient Greece for Kids", grade: "6", subject: "History", youtubeId: "6b5nN4NOY-Q" },
    { id: 32, title: "Newton's Laws of Motion", grade: "6", subject: "Science", youtubeId: "kKKM8Y-u7ds" },
    { id: 33, title: "Ratios and Proportions", grade: "6", subject: "Math", youtubeId: "GOkI_2i2-yI" },
    { id: 34, "title": "Theme in Literature", "grade": "6", "subject": "English", "youtubeId": "p4qME64SkxM" },
    { id: 35, title: "Plate Tectonics Explained", grade: "6", subject: "Science", youtubeId: "DLzYyWEQ8dc" },
    
    // Grade 7
    { id: 36, title: "The Cell: An Introduction", grade: "7", subject: "Science", youtubeId: "8IlzKri08kk" },
    { id: 37, title: "Pythagorean Theorem", grade: "7", subject: "Math", youtubeId: "WQfvyAN_B_4" },
    { id: 38, title: "World War I Summary", grade: "7", subject: "History", youtubeId: "dYrofaDfMKI" },
    { id: 39, "title": "How to Find the Main Idea", "grade": "7", "subject": "English", "youtubeId": "R46_y2yH3k4" },
    { id: 40, title: "Scientific Method for Kids", grade: "7", subject: "Science", youtubeId: "3fsA19-rD30" },
    { id: 41, title: "Solving Two-Step Equations", grade: "7", subject: "Math", youtubeId: "LDJ_V1a7HSo" },
    
    // Grade 8
    { id: 42, title: "Solving Linear Equations", grade: "8", subject: "Math", youtubeId: "N4_Fzz_h3fs" },
    { id: 43, title: "The Periodic Table Explained", grade: "8", subject: "Science", youtubeId: "0RRVV4Diomg" },
    { id: 44, title: "The American Civil War", grade: "8", subject: "History", youtubeId: "rY9zHNOjGrs" },
    { id: 45, title: "Functions Explained", grade: "8", subject: "Math", youtubeId: "52tpYl2t3wU" },
    { id: 46, title: "DNA, Chromosomes, Genes, and Traits", grade: "8", subject: "Science", youtubeId: "8m6hHRlKwxY" },
    { id: 47, "title": "Shakespeare's Sonnets", "grade": "8", "subject": "English", "youtubeId": "bI-22I5t_uA" },
    { id: 48, title: "The Cold War - OverSimplified (Part 1)", grade: "8", subject: "History", youtubeId: "I79wWrsCfFc" },
    { id: 49, title: "Graphing Linear Equations", grade: "8", subject: "Math", youtubeId: "2UrcUfBizyw" },
    { id: 50, title: "Chemical Reactions and Equations", grade: "8", subject: "Science", youtubeId: "2S6e11NBwiw" },
    { id: 51, "title": "Types of Conflict in Literature", "grade": "8", "subject": "English", "youtubeId": "dMG Moyd-2M" },

    // Grade 9 - Chemistry
    { id: 52, title: "Intro to Chemistry, Basic Concepts", grade: "9", subject: "Chemistry", youtubeId: "L2Q2q20KaEk" },
    { id: 53, title: "Types of Chemical Reactions", grade: "9", subject: "Chemistry", youtubeId: "P_M3_LDd1sI" },
    { id: 54, title: "Balancing Chemical Equations", grade: "9", subject: "Chemistry", youtubeId: "zmdxMlb88Fs" },
    { id: 55, title: "The Structure of an Atom", grade: "9", subject: "Chemistry", youtubeId: "LhX5_2l2-T0" },
    // Grade 9 - Physics
    { id: 56, title: "Introduction to Physics", grade: "9", subject: "Physics", youtubeId: "AzW0h2n23RA" },
    { id: 57, title: "Kinematics in One Dimension", grade: "9", subject: "Physics", youtubeId: "21-b6aCVh1A" },
    { id: 58, title: "Newton's First Law of Motion", grade: "9", subject: "Physics", youtubeId: "1b_aA8T6s9o" },
    { id: 59, title: "Introduction to Vectors and Scalars", grade: "9", subject: "Physics", youtubeId: "ikP_23j12es" },
    
    // Grade 10 - Chemistry
    { id: 60, title: "Stoichiometry Basic Introduction", grade: "10", subject: "Chemistry", youtubeId: "bnpEycf4-wA" },
    { id: 61, title: "Acids and Bases", grade: "10", subject: "Chemistry", youtubeId: "FM2ChbKn_d4" },
    { id: 62, title: "Gas Law Problems", grade: "10", subject: "Chemistry", youtubeId: "gQ3_2n-JSkE" },
    { id: 63, title: "Solutions: Crash Course Chemistry", grade: "10", subject: "Chemistry", youtubeId: "9h2f1Bv2_oQ" },
    // Grade 10 - Physics
    { id: 64, title: "Work, Energy, and Power", grade: "10", subject: "Physics", youtubeId: "w4QFJb9a8vo" },
    { id: 65, title: "Introduction to Waves", grade: "10", subject: "Physics", youtubeId: "JXaNyS_G_8g" },
    { id: 66, title: "Introduction to Circuits", grade: "10", subject: "Physics", youtubeId: "F_vLWkkOETI" },
    { id: 67, title: "Reflection and Refraction", grade: "10", subject: "Physics", youtubeId: "l6z2V_y2ifo" },
    
    // Grade 11 - Chemistry
    { id: 68, title: "Thermodynamics and Endothermic vs. Exothermic Reactions", grade: "11", subject: "Chemistry", youtubeId: "G_2eYSSp_gE" },
    { id: 69, title: "Electron Configuration", grade: "11", subject: "Chemistry", youtubeId: "cPDptc0w8J8" },
    { id: 70, title: "VSEPR Theory: Introduction", grade: "11", subject: "Chemistry", youtubeId: "Q9hB-Bq7N-k" },
    { id: 71, title: "Introduction to Organic Chemistry", grade: "11", subject: "Chemistry", youtubeId: "n-1R65SAO0U" },
    // Grade 11 - Physics
    { id: 72, title: "Rotational Motion", grade: "11", subject: "Physics", youtubeId: "CH11vOEYG3E" },
    { id: 73, title: "Universal Gravitation", grade: "11", subject: "Physics", youtubeId: "d4-syx1442M" },
    { id: 74, title: "Fluid Pressure", grade: "11", subject: "Physics", youtubeId: "fP13p_ceS_g" },
    { id: 75, title: "Simple Harmonic Motion", grade: "11", subject: "Physics", youtubeId: "tNpuwglm5fE" },
    
    // Grade 12 - Chemistry
    { id: 76, title: "Chemical Kinetics: Rate Laws", grade: "12", subject: "Chemistry", youtubeId: "O_t4-4-vWvM" },
    { id: 77, title: "Chemical Equilibrium", grade: "12", subject: "Chemistry", youtubeId: "cHAjhW1aI1M" },
    { id: 78, title: "Introduction to Electrochemistry", grade: "12", subject: "Chemistry", youtubeId: "teTkvUtW4hA" },
    { id: 79, title: "Nuclear Chemistry", grade: "12", subject: "Chemistry", youtubeId: "VTHQY-t-d-s" },
    // Grade 12 - Physics
    { id: 80, title: "Electromagnetism - Maxwell's Equations", grade: "12", subject: "Physics", youtubeId: "K40l22e7_gU" },
    { id: 81, title: "Special Relativity", grade: "12", subject: "Physics", youtubeId: "ajhFNcUTJI0" },
    { id: 82, title: "Introduction to Quantum Mechanics", grade: "12", subject: "Physics", youtubeId: "iVpXrbZ4bnU" },
    { id: 83, title: "What is String Theory?", grade: "12", subject: "Physics", youtubeId: "kF4ju6j6aLE" }
];
