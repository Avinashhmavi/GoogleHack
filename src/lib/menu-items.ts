
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
  Video,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Define menu item type
export interface MenuItem {
  href: string;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<any>;
}

// Define category type
export interface MenuCategory {
  id: string;
  labelKey: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
}

// Categorized menu structure
export const menuCategories: MenuCategory[] = [
  {
    id: 'get-started',
    labelKey: 'getStarted',
    icon: LayoutDashboard,
    items: [
      { href: '/', labelKey: 'getStarted', descriptionKey: 'dashboard_desc', icon: LayoutDashboard },
      { href: '/ask-sahayak', labelKey: 'askSahayak_title', descriptionKey: 'askSahayak_dashboard_desc', icon: HelpCircle },
    ]
  },
  {
    id: 'dashboard',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    items: [
      { href: '/dashboard', labelKey: 'dashboard', descriptionKey: 'dashboard_desc', icon: LayoutDashboard },
    ]
  },
  {
    id: 'content-creation',
    labelKey: 'contentHelper',
    icon: Languages,
    items: [
      { href: '/content-creator', labelKey: 'contentCreator', descriptionKey: 'contentCreator_desc', icon: Languages },
      { href: '/content-adaptation', labelKey: 'contentAdaptation', descriptionKey: 'contentAdaptation_desc', icon: GraduationCap },
      { href: '/visual-aids-generator', labelKey: 'visualAidsGenerator', descriptionKey: 'visualAidsGenerator_desc', icon: Brush },
      { href: '/presentation-creator', labelKey: 'presentationCreator', descriptionKey: 'presentationCreator_desc', icon: Presentation },
      { href: '/video-generator', labelKey: 'videoGenerator', descriptionKey: 'videoGenerator_desc', icon: Video },
      { href: '/photo-to-worksheet', labelKey: 'photoToWorksheet', descriptionKey: 'photoToWorksheet_desc', icon: ScanLine },
      { href: '/worksheet-creator', labelKey: 'worksheetCreator', descriptionKey: 'worksheetCreator_desc', icon: WorksheetIcon },
    ]
  },
  {
    id: 'assessment',
    labelKey: 'assessment',
    icon: BarChart3,
    items: [
      { href: '/quiz-generator', labelKey: 'quizGenerator', descriptionKey: 'quizGenerator_desc', icon: FileQuestion },
      { href: '/rubric-creator', labelKey: 'rubricCreator', descriptionKey: 'rubricCreator_desc', icon: ClipboardCheck },
      { href: '/grade-tracking', labelKey: 'gradeTracking', descriptionKey: 'gradeTracking_desc', icon: BarChart3 },
      { href: '/writing-assistant', labelKey: 'writingAssistant', descriptionKey: 'writingAssistant_desc', icon: Edit },
    ]
  },
  {
    id: 'student-management',
    labelKey: 'studentManagement',
    icon: Users,
    items: [
      { href: '/student-roster', labelKey: 'studentRoster', descriptionKey: 'studentRoster_desc', icon: UserCog },
      { href: '/attendance', labelKey: 'attendance', descriptionKey: 'attendance_desc', icon: Users },
      { href: '/mentoring', labelKey: 'mentoring', descriptionKey: 'mentoring_desc', icon: HeartHandshake },
    ]
  },
  {
    id: 'planning',
    labelKey: 'planning',
    icon: CalendarDays,
    items: [
      { href: '/lesson-planner', labelKey: 'lessonPlanner', descriptionKey: 'lessonPlanner_desc', icon: BookText },
      { href: '/calendar', labelKey: 'calendar', descriptionKey: 'calendar_desc', icon: CalendarDays },
      { href: '/discussion-generator', labelKey: 'discussionGenerator', descriptionKey: 'discussionGenerator_desc', icon: MessageSquare },
    ]
  },
  {
    id: 'professional-development',
    labelKey: 'facultyProgram',
    icon: Rocket,
    items: [
      { href: '/teacher-professional-development', labelKey: 'teacherPD_title', descriptionKey: 'teacherPD_dashboard_desc', icon: Rocket },
      { href: '/smart-class', labelKey: 'smartClass_title', descriptionKey: 'smartClass_dashboard_desc', icon: School },
    ]
  },
  {
    id: 'tools',
    labelKey: 'tools',
    icon: QrCode,
    items: [
      { href: '/textbooks', labelKey: 'textbooks_title', descriptionKey: 'textbooks_description', icon: Library },
      { href: '/qr-code-generator', labelKey: 'qrCodeGenerator', descriptionKey: 'qrCodeGenerator_desc', icon: QrCode },
    ]
  },
];

// Keep the old flat structure for backward compatibility
export const menuItems = menuCategories.flatMap(category => category.items);

// Export icons for the new sidebar
export { Plus, ChevronDown, ChevronRight };
