import Link from 'next/link'
import { getMentorOverview } from '@/lib/server/mentor'

export const dynamic = 'force-dynamic'

export default async function MentorCoursesPage() {
  const overview = await getMentorOverview()
  const courses = overview.course_performance
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Courses</h1>
        <Link href="/dashboard/mentor/courses/create" className="px-3 py-2 border rounded">Create Course</Link>
      </div>
      <div className="space-y-3">
        {courses.map(c => (
          <div key={c.course_id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-muted-foreground">{c.enrolled_count} students • {new Date(c.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <Link href={`/dashboard/mentor/courses/${c.course_id}`} className="px-3 py-1 border rounded">View</Link>
              <Link href={`/dashboard/mentor/courses/${c.course_id}/edit`} className="px-3 py-1 border rounded">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
