import 'server-only'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
const API_PREFIX = '/api/v1'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Next.js 15: cookies() must be awaited
  const cookieStore = await cookies()
  const token = cookieStore.get('kfats_token')?.value
  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json()
}

export type MentorOverviewResponse = {
  overview: {
    total_courses: number
    total_students: number
    enrollments_last_30d: number
    avg_completion: number
    monthly_enrollments: Array<{ month: string; count: number }>
  }
  course_performance: Array<{
    course_id: number
    title: string
    enrolled_count: number
    avg_completion: number
    status: string
    created_at: string
    last_updated: string
  }>
}

export async function getMentorOverview(): Promise<MentorOverviewResponse> {
  return authFetch('/mentors/me/overview')
}

export type MentorStudentsResponse = {
  items: Array<{
    user_id: number
    full_name: string
    email: string
    course_id: number
    course_title: string
    enrolled_at: string
    progress_percentage: number
    status: string
  }>
  total: number
  page: number
  size: number
  pages: number
}

export async function getMentorStudents(params?: { page?: number; size?: number; course_id?: number }): Promise<MentorStudentsResponse> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set('page', String(params.page))
  if (params?.size) sp.set('size', String(params.size))
  if (params?.course_id) sp.set('course_id', String(params.course_id))
  const qs = sp.toString()
  return authFetch(`/mentors/me/students${qs ? `?${qs}` : ''}`)
}

export type MentorActivityResponse = {
  activities: Array<{
    type: string
    description: string
    timestamp: string
    course_id: number
    course_title: string
    user_id?: number
    student_name?: string
  }>
}

export async function getMentorActivity(limit = 50): Promise<MentorActivityResponse> {
  return authFetch(`/mentors/me/activity?limit=${limit}`)
}
