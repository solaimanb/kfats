export default function StudentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your courses, track progress, and access learning materials.
        </p>
      </div>
      
      {/* Student dashboard content will go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Enrolled Courses</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Completed</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">In Progress</h3>
          <p className="text-2xl font-bold">4</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Certificates</h3>
          <p className="text-2xl font-bold">6</p>
        </div>
      </div>
    </div>
  )
}
