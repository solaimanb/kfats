import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CoursesAPI } from '../api/courses'
import { CourseCreate } from '../types/api'

// Query keys
export const coursesKeys = {
  all: ['courses'] as const,
  lists: () => [...coursesKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...coursesKeys.lists(), { filters }] as const,
  details: () => [...coursesKeys.all, 'detail'] as const,
  detail: (id: number) => [...coursesKeys.details(), id] as const,
  myCourses: () => [...coursesKeys.all, 'my-courses'] as const,
  enrollments: () => [...coursesKeys.all, 'enrollments'] as const,
  courseEnrollments: (courseId: number) => [...coursesKeys.enrollments(), courseId] as const,
}

/**
 * Hook to get all courses
 */
export function useCourses(params?: {
  page?: number
  size?: number
  level?: string
  mentor_id?: number
  search?: string
}) {
  return useQuery({
    queryKey: coursesKeys.list(params || {}),
    queryFn: () => CoursesAPI.getAllCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get course by ID
 */
export function useCourse(courseId: number) {
  return useQuery({
    queryKey: coursesKeys.detail(courseId),
    queryFn: () => CoursesAPI.getCourseById(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get mentor's courses
 */
export function useMentorCourses() {
  return useQuery({
    queryKey: coursesKeys.myCourses(),
    queryFn: CoursesAPI.getMentorCourses,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to get student's enrollments
 */
export function useStudentEnrollments() {
  return useQuery({
    queryKey: coursesKeys.enrollments(),
    queryFn: CoursesAPI.getStudentEnrollments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to get course enrollments
 */
export function useCourseEnrollments(courseId: number) {
  return useQuery({
    queryKey: coursesKeys.courseEnrollments(courseId),
    queryFn: () => CoursesAPI.getCourseEnrollments(courseId),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook for creating a course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: CourseCreate) => CoursesAPI.createCourse(courseData),
    onSuccess: () => {
      // Invalidate courses lists and mentor courses
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: coursesKeys.myCourses() })
    },
  })
}

/**
 * Hook for updating a course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, courseData }: { courseId: number; courseData: Partial<CourseCreate> }) =>
      CoursesAPI.updateCourse(courseId, courseData),
    onSuccess: (updatedCourse) => {
      // Update specific course cache
      queryClient.setQueryData(coursesKeys.detail(updatedCourse.id), updatedCourse)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: coursesKeys.myCourses() })
    },
  })
}

/**
 * Hook for deleting a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: number) => CoursesAPI.deleteCourse(courseId),
    onSuccess: (_, courseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: coursesKeys.detail(courseId) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: coursesKeys.myCourses() })
    },
  })
}

/**
 * Hook for enrolling in a course
 */
export function useEnrollInCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: number) => CoursesAPI.enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      // Invalidate enrollments and course details
      queryClient.invalidateQueries({ queryKey: coursesKeys.enrollments() })
      queryClient.invalidateQueries({ queryKey: coursesKeys.detail(courseId) })
      queryClient.invalidateQueries({ queryKey: coursesKeys.courseEnrollments(courseId) })
    },
  })
}

/**
 * Hook for updating enrollment progress
 */
export function useUpdateEnrollmentProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: number; progress: number }) =>
      CoursesAPI.updateEnrollmentProgress(enrollmentId, progress),
    onSuccess: () => {
      // Invalidate enrollment-related queries
      queryClient.invalidateQueries({ queryKey: coursesKeys.enrollments() })
    },
  })
}
