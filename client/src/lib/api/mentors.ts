import { apiClient } from "./client";
import { PaginatedResponse } from "@/lib/types/api";

export interface MonthlyEnrollment {
  month: string;
  count: number;
}

export interface CoursePerformanceItem {
  course_id: number;
  title: string;
  enrolled_count: number;
  avg_completion: number;
  status: string;
  created_at: string;
  last_updated: string;
}

export interface MentorOverview {
  total_courses: number;
  total_students: number;
  enrollments_last_30d: number;
  avg_completion: number;
  monthly_enrollments: MonthlyEnrollment[];
}

export interface MentorOverviewResponse {
  overview: MentorOverview;
  course_performance: CoursePerformanceItem[];
}

export interface MentorStudentItem {
  user_id: number;
  full_name: string;
  email: string;
  course_id: number;
  course_title: string;
  enrolled_at: string;
  progress_percentage: number;
  status: string;
}

export interface MentorActivityItem {
  type: string;
  description: string;
  timestamp: string;
  course_id: number;
  course_title: string;
  user_id?: number;
  student_name?: string;
}

export class MentorsAPI {
  /**
   * Get mentor overview and performance metrics
   */
  static async getMentorOverview(): Promise<MentorOverviewResponse> {
    const response = await apiClient.get<MentorOverviewResponse>(
      "/mentors/me/overview"
    );
    return response.data;
  }

  /**
   * Get paginated list of mentor's students
   */
  static async getMentorStudents(
    filters: {
      page?: number;
      size?: number;
      course_id?: number;
    } = {}
  ): Promise<PaginatedResponse<MentorStudentItem>> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());
    if (filters.course_id)
      params.append("course_id", filters.course_id.toString());

    const response = await apiClient.get<PaginatedResponse<MentorStudentItem>>(
      `/mentors/me/students?${params}`
    );
    return response.data;
  }

  /**
   * Get mentor's recent activity
   */
  static async getMentorActivity(
    limit = 50
  ): Promise<{ activities: MentorActivityItem[] }> {
    const response = await apiClient.get<{ activities: MentorActivityItem[] }>(
      `/mentors/me/activity?limit=${limit}`
    );
    return response.data;
  }
}
