import { BookOpen, Users, TrendingUp, Eye, Edit, Star, DollarSign } from "lucide-react"

export const getMentorActivityIcon = (type: string) => {
  switch (type) {
    case "course_created":
      return BookOpen
    case "student_enrolled":
      return Users
    case "course_updated":
      return Edit
    case "course_viewed":
      return Eye
    case "rating_received":
      return Star
    case "revenue_earned":
      return DollarSign
    default:
      return TrendingUp
  }
}

export const getMentorActivityColor = (type: string) => {
  switch (type) {
    case "course_created":
      return "text-blue-600"
    case "student_enrolled":
      return "text-green-600"
    case "course_updated":
      return "text-purple-600"
    case "course_viewed":
      return "text-gray-600"
    case "rating_received":
      return "text-yellow-600"
    case "revenue_earned":
      return "text-emerald-600"
    default:
      return "text-gray-600"
  }
}

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 border-green-200"
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "pending":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatPercentage = (value: number) => {
  return `${Math.round(value * 100) / 100}%`
}
