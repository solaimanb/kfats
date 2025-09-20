import { MentorStudentsTable } from "./mentor-students-table";
import { getMentorStudents } from "@/lib/server/mentor";
import { unstable_noStore } from "next/cache";

export const revalidate = 0;

type StudentsResponse = {
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

export default async function MentorStudentsPage() {
  unstable_noStore();

  let data: StudentsResponse | null = null;
  let error: string | null = null;

  try {
    data = await getMentorStudents({ page: 1, size: 20 });
  } catch (err) {
    console.error("Failed to fetch mentor students:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to load students data. Please try refreshing the page.";
    error = errorMessage;

    data = {
      items: [],
      total: 0,
      page: 1,
      size: 20,
      pages: 0,
    };
  }

  return (
    <MentorStudentsTable
      initialData={data}
      error={error}
    />
  );
}
