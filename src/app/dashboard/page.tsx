"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { 
  getDashboardStatsAction 
} from "@/lib/actions";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Rocket, 
  QrCode,
  TrendingUp,
  Clock,
  Award,
  Activity,
  RefreshCw,
  Plus,
  Eye,
  FileText,
  Video,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";

interface DashboardStats {
  totalStudents: number;
  totalGrades: number;
  averageGrade: number;
  upcomingEvents: number;
  totalRecordings: number;
  lessonsThisMonth: number;
  attendanceRate: number;
  recentActivity: Array<{
    id: string;
    type: 'lesson' | 'grade' | 'event' | 'recording';
    title: string;
    date: Date;
    icon: any;
    color: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { authStatus, user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalGrades: 0,
    averageGrade: 0,
    upcomingEvents: 0,
    totalRecordings: 0,
    lessonsThisMonth: 0,
    attendanceRate: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    if (authStatus !== 'authenticated' || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await user.getIdToken();

      // Fetch all dashboard data in one optimized call
      const result = await getDashboardStatsAction(token);

      if (result.success && result.data) {
        const { 
          totalStudents, 
          totalGrades, 
          averageGrade, 
          upcomingEvents, 
          totalRecordings, 
          lessonsThisMonth, 
          attendanceRate,
          students,
          grades,
          events,
          recordings
        } = result.data;

        // Generate recent activity
        const recentActivity: Array<{
          id: string;
          type: 'lesson' | 'grade' | 'event' | 'recording';
          title: string;
          date: Date;
          icon: any;
          color: string;
        }> = [];
        
        // Add recent grades
        const recentGrades = grades
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        
        recentGrades.forEach(grade => {
          recentActivity.push({
            id: grade.id,
            type: 'grade' as const,
            title: `Grade recorded for ${grade.studentName} - ${grade.subject}`,
            date: new Date(grade.date),
            icon: BarChart3,
            color: 'text-green-600'
          });
        });

        // Add recent events
        const recentEvents = events
          .sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : a.date.toDate();
            const dateB = b.date instanceof Date ? b.date : b.date.toDate();
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 2);
        
        recentEvents.forEach(event => {
          const eventDate = event.date instanceof Date ? event.date : event.date.toDate();
          recentActivity.push({
            id: event.id,
            type: 'event' as const,
            title: `${event.type}: ${event.title}`,
            date: eventDate,
            icon: Calendar,
            color: 'text-blue-600'
          });
        });

        // Add recent recordings
        const recentRecordings = recordings
          .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
            const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 2);
        
        recentRecordings.forEach(recording => {
          const recordingDate = recording.createdAt instanceof Date ? recording.createdAt : recording.createdAt.toDate();
          recentActivity.push({
            id: recording.id,
            type: 'recording' as const,
            title: `Recording: ${recording.name}`,
            date: recordingDate,
            icon: Video,
            color: 'text-purple-600'
          });
        });

        // Sort all activities by date
        recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

        setStats({
          totalStudents,
          totalGrades,
          averageGrade,
          upcomingEvents,
          totalRecordings,
          lessonsThisMonth,
          attendanceRate,
          recentActivity: recentActivity.slice(0, 6)
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load dashboard data.",
          variant: "destructive",
        });
      }

      setLastUpdated(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authStatus, user]);

  const quickActions = [
    {
      title: "Add Student",
      description: "Register a new student",
      icon: Users,
      href: "/student-roster",
      color: "bg-blue-500",
    },
    {
      title: "Create Lesson",
      description: "Generate a new lesson plan",
      icon: BookOpen,
      href: "/lesson-planner",
      color: "bg-green-500",
    },
    {
      title: "Take Attendance",
      description: "Mark student attendance",
      icon: CheckCircle,
      href: "/attendance",
      color: "bg-purple-500",
    },
    {
      title: "Add Grade",
      description: "Record student grades",
      icon: BarChart3,
      href: "/grade-tracking",
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (value: number, threshold: number) => {
    return value >= threshold ? "text-green-600" : "text-orange-600";
  };

  const getStatusIcon = (value: number, threshold: number) => {
    return value >= threshold ? TrendingUp : AlertCircle;
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your teaching activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {format(lastUpdated, 'HH:mm')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStudents > 0 ? 'Active students' : 'No students registered'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGrades > 0 ? `${stats.totalGrades} grades recorded` : 'No grades yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {getStatusColor(stats.attendanceRate, 80) === "text-green-600" ? 'Excellent' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents > 0 ? 'Events scheduled' : 'No upcoming events'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons This Month</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lessonsThisMonth}</div>
            <p className="text-xs text-muted-foreground">Planned lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Recordings</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecordings}</div>
            <p className="text-xs text-muted-foreground">Recorded sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageGrade >= 80 ? 'Excellent' : stats.averageGrade >= 70 ? 'Good' : 'Needs Work'}
            </div>
            <p className="text-xs text-muted-foreground">Class performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
            <CardDescription>Your recent teaching activities and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {isToday(activity.date) 
                          ? `Today at ${format(activity.date, 'HH:mm')}`
                          : isTomorrow(activity.date)
                          ? `Tomorrow at ${format(activity.date, 'HH:mm')}`
                          : format(activity.date, 'MMM d, yyyy')
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground">Start by adding students or creating lessons</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 