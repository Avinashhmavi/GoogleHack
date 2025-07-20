
import { config } from 'dotenv';
config();

import '@/ai/flows/adapt-content-grade-level.ts';
import '@/ai/flows/generate-answer-key-qr-code.ts';
import '@/ai/flows/photo-to-worksheet.ts';
import '@/ai/flows/generate-localized-content.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/create-rubric.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/enhance-writing.ts';
import '@/ai/flows/recognize-students.ts';
import '@/ai/flows/recognize-students.types.ts';
import '@/ai/flows/create-lesson-plan.ts';
import '@/ai/flows/generate-discussion.ts';
import '@/ai/flows/generate-visual-aid.ts';
