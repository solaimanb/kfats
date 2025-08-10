"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CoursesAPI } from '@/lib/api/courses'
import type { Course } from '@/lib/types/api'

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|undefined>()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data: Course = await CoursesAPI.getCourseById(id)
        if (!mounted) return
        setTitle(data.title)
        setDescription(data.description)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load course'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
    return () => { mounted = false }
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(undefined)
    try {
      await CoursesAPI.updateCourse(id, { title, description })
      router.push(`/dashboard/mentor/courses/${id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update course'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Edit Course</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button disabled={saving} className="px-4 py-2 border rounded">{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}
