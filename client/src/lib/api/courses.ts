import { apiClient } from './client'
import { Course, CourseCreate, Enrollment, PaginatedResponse, ApiResponse } from '../types/api'

export class CoursesAPI {
  /**
   * Create a new course (Mentor/Admin only)
   */
  static async createCourse(courseData: CourseCreate): Promise<Course> {
    const response = await apiClient.post<Course>('/courses/', courseData)
    return response.data
  }

  /**
   * Get all published courses
   */
  static async getAllCourses(params?: {
    page?: number
    size?: number
    mentor_id?: number
  }): Promise<PaginatedResponse<Course>> {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses/', { params })
    return response.data
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: number): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${courseId}`)
    return response.data
  }

  /**
   * Get mentor's courses
   */
  static async getMentorCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/my-courses')
    return response.data
  }

  /**
   * Update course (Mentor/Admin only)
   */
  static async updateCourse(courseId: number, courseData: Partial<CourseCreate>): Promise<Course> {
    const response = await apiClient.put<Course>(`/courses/${courseId}`, courseData)
    return response.data
  }

  /**
   * Delete course (Mentor/Admin only)
   */
  static async deleteCourse(courseId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/courses/${courseId}`)
    return response.data
  }

  /**
   * Enroll in a course
   */
  static async enrollInCourse(courseId: number): Promise<ApiResponse<{ course_id: number; enrollment_id: number }>> {
    const response = await apiClient.post<ApiResponse<{ course_id: number; enrollment_id: number }>>(`/courses/${courseId}/enroll`)
    return response.data
  }

  /**
   * Get course enrollments (Mentor/Admin only)
   */
  static async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>(`/courses/${courseId}/enrollments`)
    return response.data
  }

  /**
   * Get student's enrollments
   */
  static async getStudentEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/courses/my-enrollments')
    return response.data
  }

  /**
   * Update enrollment progress
   */
  static async updateEnrollmentProgress(
    enrollmentId: number, 
    progress: number
  ): Promise<Enrollment> {
    const response = await apiClient.put<Enrollment>(
      `/courses/enrollments/${enrollmentId}/progress`, 
      { progress_percentage: progress }
    )
    return response.data
  }
}
