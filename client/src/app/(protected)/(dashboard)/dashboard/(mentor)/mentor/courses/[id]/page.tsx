import { getMentorOverview } from '@/lib/server/mentor'

export const dynamic = 'force-dynamic'

export default async function MentorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const overview = await getMentorOverview()
  const course = overview.course_performance.find(c => String(c.course_id) === id)
  if (!course) {
    return <div>Course not found</div>
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{course.title}</h1>
      <div className="text-sm text-muted-foreground">Created: {new Date(course.created_at).toLocaleString()}</div>
      <div className="p-4 border rounded">Enrolled students: {course.enrolled_count}</div>
    </div>
  )
}
