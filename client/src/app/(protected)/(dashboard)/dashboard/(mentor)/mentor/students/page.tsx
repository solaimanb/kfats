import { getMentorStudents } from '@/lib/server/mentor'

export const dynamic = 'force-dynamic'

export default async function MentorStudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const sp = await searchParams
  const pageParam = Array.isArray(sp?.page) ? sp?.page[0] : sp?.page
  const sizeParam = Array.isArray(sp?.size) ? sp?.size[0] : sp?.size
  const courseIdParam = Array.isArray(sp?.course_id) ? sp?.course_id[0] : sp?.course_id

  const page = Number(pageParam) || 1
  const size = Number(sizeParam) || 20
  const course_id = Number(courseIdParam)

  const data = await getMentorStudents({ page, size, course_id: Number.isFinite(course_id) ? course_id : undefined })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Students</h1>
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Student</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Enrolled</th>
              <th className="text-left p-3">Progress</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr key={`${it.user_id}-${it.course_id}`} className="border-b last:border-0">
                <td className="p-3">{it.full_name}</td>
                <td className="p-3">{it.email}</td>
                <td className="p-3">{it.course_title}</td>
                <td className="p-3">{new Date(it.enrolled_at).toLocaleDateString()}</td>
                <td className="p-3">{Math.round(it.progress_percentage)}%</td>
                <td className="p-3 capitalize">{it.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {data.page} of {data.pages} — {data.total} total
        </span>
        <div className="flex gap-2">
          <a
            href={`?page=${Math.max(1, data.page - 1)}&size=${data.size}${course_id ? `&course_id=${course_id}` : ''}`}
            className={`px-3 py-1 border rounded ${data.page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Previous
          </a>
          <a
            href={`?page=${Math.min(data.pages || 1, data.page + 1)}&size=${data.size}${course_id ? `&course_id=${course_id}` : ''}`}
            className={`px-3 py-1 border rounded ${data.page >= (data.pages || 1) ? 'pointer-events-none opacity-50' : ''}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  )
}
