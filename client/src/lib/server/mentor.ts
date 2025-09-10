import "server-only";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_PREFIX = "/api/v1";

async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("kfats_token")?.value || null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();

  // If no token is available, throw a specific authentication error
  if (!token) {
    throw new Error(
      "Authentication required. Please log in to access this data."
    );
  }

  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // Handle specific error cases
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Authentication required. Please log in to access this data.`
      );
    }
    if (res.status === 404) {
      throw new Error(`API endpoint not found: ${path}`);
    }
    if (res.status >= 500) {
      throw new Error(`Server error (${res.status}). Please try again later.`);
    }

    // For other errors, try to get more details from response
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export type MentorOverviewResponse = {
  overview: {
    total_courses: number;
    total_students: number;
    enrollments_last_30d: number;
    avg_completion: number;
    monthly_enrollments: Array<{ month: string; count: number }>;
  };
  course_performance: Array<{
    course_id: number;
    title: string;
    enrolled_count: number;
    avg_completion: number;
    status: string;
    created_at: string;
    last_updated: string;
  }>;
};

export async function getMentorOverview(): Promise<MentorOverviewResponse> {
  return authFetch("/mentors/me/overview");
}

export type MentorStudentsResponse = {
  items: Array<{
    user_id: number;
    full_name: string;
    email: string;
    course_id: number;
    course_title: string;
    enrolled_at: string;
    progress_percentage: number;
    status: string;
  }>;
  total: number;
  page: number;
  size: number;
  pages: number;
};

export async function getMentorStudents(params?: {
  page?: number;
  size?: number;
  course_id?: number;
}): Promise<MentorStudentsResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.size) sp.set("size", String(params.size));
  if (params?.course_id) sp.set("course_id", String(params.course_id));
  const qs = sp.toString();
  return authFetch(`/mentors/me/students${qs ? `?${qs}` : ""}`);
}

export type MentorActivityResponse = {
  activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    course_id: number;
    course_title: string;
    user_id?: number;
    student_name?: string;
  }>;
};

export async function getMentorActivity(
  limit = 50
): Promise<MentorActivityResponse> {
  return authFetch(`/mentors/me/activity?limit=${limit}`);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}
