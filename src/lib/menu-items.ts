
import {
  GraduationCap,
  Languages,
  QrCode,
  ScanLine,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  FileQuestion,
  ClipboardCheck,
  Edit,
  Users,
  UserCog,
  BookText,
  MessageSquare,
  Brush,
  HelpCircle,
  Presentation,
  CalendarDays,
  School,
  Library,
  Rocket,
  FileText as WorksheetIcon,
  HeartHandshake,
} from 'lucide-react';

export const menuItems = [
  { href: '/', labelKey: 'dashboard', descriptionKey: 'dashboard_desc', icon: LayoutDashboard },
  { href: '/ask-sahayak', labelKey: 'askSahayak_title', descriptionKey: 'askSahayak_dashboard_desc', icon: HelpCircle },
  { href: '/smart-class', labelKey: 'smartClass_title', descriptionKey: 'smartClass_dashboard_desc', icon: School },
  { href: '/textbooks', labelKey: 'textbooks_title', descriptionKey: 'textbooks_description', icon: Library },
  { href: '/teacher-professional-development', labelKey: 'teacherPD_title', descriptionKey: 'teacherPD_dashboard_desc', icon: Rocket },
  { href: '/photo-to-worksheet', labelKey: 'photoToWorksheet', descriptionKey: 'photoToWorksheet_desc', icon: ScanLine },
  { href: '/worksheet-creator', labelKey: 'worksheetCreator', descriptionKey: 'worksheetCreator_desc', icon: WorksheetIcon },
  { href: '/content-creator', labelKey: 'contentCreator', descriptionKey: 'contentCreator_desc', icon: Languages },
  { href: '/content-adaptation', labelKey: 'contentAdaptation', descriptionKey: 'contentAdaptation_desc', icon: GraduationCap },
  { href: '/visual-aids-generator', labelKey: 'visualAidsGenerator', descriptionKey: 'visualAidsGenerator_desc', icon: Brush },
  { href: '/presentation-creator', labelKey: 'presentationCreator', descriptionKey: 'presentationCreator_desc', icon: Presentation },
  { href: '/calendar', labelKey: 'calendar', descriptionKey: 'calendar_desc', icon: CalendarDays },
  { href: '/qr-code-generator', labelKey: 'qrCodeGenerator', descriptionKey: 'qrCodeGenerator_desc', icon: QrCode },
  { href: '/grade-tracking', labelKey: 'gradeTracking', descriptionKey: 'gradeTracking_desc', icon: BarChart3 },
  { href: '/quiz-generator', labelKey: 'quizGenerator', descriptionKey: 'quizGenerator_desc', icon: FileQuestion },
  { href: '/rubric-creator', labelKey: 'rubricCreator', descriptionKey: 'rubricCreator_desc', icon: ClipboardCheck },
  { href: '/writing-assistant', labelKey: 'writingAssistant', descriptionKey: 'writingAssistant_desc', icon: Edit },
  { href: '/attendance', labelKey: 'attendance', descriptionKey: 'attendance_desc', icon: Users },
  { href: '/student-roster', labelKey: 'studentRoster', descriptionKey: 'studentRoster_desc', icon: UserCog },
  { href: '/lesson-planner', labelKey: 'lessonPlanner', descriptionKey: 'lessonPlanner_desc', icon: BookText },
  { href: '/discussion-generator', labelKey: 'discussionGenerator', descriptionKey: 'discussionGenerator_desc', icon: MessageSquare },
  { href: '/mentoring', labelKey: 'mentoring', descriptionKey: 'mentoring_desc', icon: HeartHandshake },
];
