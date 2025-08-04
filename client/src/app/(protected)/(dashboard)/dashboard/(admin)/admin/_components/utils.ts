import { Users, BookOpen, PenTool, Activity } from "lucide-react"

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registration':
      return Users
    case 'course_created':
      return BookOpen
    case 'article_published':
      return PenTool
    default:
      return Activity
  }
}

export const getActivityIconProps = (type: string) => {
  switch (type) {
    case 'user_registration':
      return "h-4 w-4 text-blue-500"
    case 'course_created':
      return "h-4 w-4 text-green-500"
    case 'article_published':
      return "h-4 w-4 text-purple-500"
    default:
      return "h-4 w-4 text-gray-500"
  }
}

export const getActivityColor = (type: string) => {
  switch (type) {
    case 'user_registration':
      return 'bg-blue-50 border-blue-200'
    case 'course_created':
      return 'bg-green-50 border-green-200'
    case 'article_published':
      return 'bg-purple-50 border-purple-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getStatusTextClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600'
    case 'suspended':
      return 'text-red-600'
    case 'pending':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}
