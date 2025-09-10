export interface MentorDashboardProps {
  userId?: number;
}

export interface MentorOverviewData {
  my_courses: number;
  total_students: number;
  total_enrollments: number;
  total_revenue: number;
  monthly_revenue: number;
  course_completion_rate: number;
  average_rating: number;
}

export interface CoursePerformance {
  course_id: number;
  title: string;
  enrolled_count: number;
  avg_completion: number;
  status: string;
  created_at: string;
  last_updated: string;
}

export interface StudentEngagement {
  active_students: number;
  new_enrollments_this_month: number;
  completion_trends: Array<{
    month: string;
    completions: number;
  }>;
  engagement_rate: number;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_revenue: number;
  revenue_by_course: Array<{
    course_id: number;
    title: string;
    revenue: number;
  }>;
  revenue_trends: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface MentorActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  course_title?: string;
}

export interface MentorAnalytics {
  overview: MentorOverviewData;
  course_performance: CoursePerformance[];
  student_engagement: StudentEngagement;
  revenue_analytics: RevenueAnalytics;
  recent_activity: MentorActivity[];
}
