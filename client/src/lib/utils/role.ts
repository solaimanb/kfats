import { createElement, type ComponentType } from 'react'
import { BookOpen, GraduationCap, PenTool, ShoppingBag, Shield, User as UserIcon, Users, FileText } from 'lucide-react'
import { UserRole, type ApplicationableRole } from '@/lib/types/api'

type BadgeVariant = 'soft' | 'solid'

const COLOR_CLASSES: Record<string, { soft: string; solid: string }> = {
  red: {
    soft: 'bg-red-100 text-red-800 border-red-200',
    solid: 'bg-red-500 text-white',
  },
  green: {
    soft: 'bg-green-100 text-green-800 border-green-200',
    solid: 'bg-green-500 text-white',
  },
  purple: {
    soft: 'bg-purple-100 text-purple-800 border-purple-200',
    solid: 'bg-purple-500 text-white',
  },
  orange: {
    soft: 'bg-orange-100 text-orange-800 border-orange-200',
    solid: 'bg-orange-500 text-white',
  },
  blue: {
    soft: 'bg-blue-100 text-blue-800 border-blue-200',
    solid: 'bg-blue-500 text-white',
  },
  gray: {
    soft: 'bg-gray-100 text-gray-800 border-gray-200',
    solid: 'bg-gray-500 text-white',
  },
}

const ROLE_TO_COLOR: Record<string, keyof typeof COLOR_CLASSES> = {
  admin: 'red',
  mentor: 'green',
  writer: 'purple',
  seller: 'orange',
  student: 'blue',
  user: 'gray',
}

export function getRoleBadgeClasses(
  role: string | UserRole,
  variant: BadgeVariant = 'soft'
): string {
  const key = (typeof role === 'string' ? role : String(role)).toLowerCase()
  const color = ROLE_TO_COLOR[key] ?? 'gray'
  return COLOR_CLASSES[color][variant]
}

export type IconComponent = ComponentType<{ className?: string }>

export function getUserRoleIconComponent(role: string | UserRole): IconComponent {
  const key = (typeof role === 'string' ? role : String(role)).toLowerCase()
  switch (key) {
    case 'student':
      return BookOpen
    case 'mentor':
      return GraduationCap
    case 'writer':
      return PenTool
    case 'seller':
      return ShoppingBag
    case 'admin':
      return Shield
    default:
      return UserIcon
  }
}

export function getApplicationRoleIconComponent(role: string | ApplicationableRole): IconComponent {
  const key = (typeof role === 'string' ? role : String(role)).toLowerCase()
  switch (key) {
    case 'mentor':
      return Users
    case 'seller':
      return ShoppingBag
    case 'writer':
      return PenTool
    default:
      return FileText
  }
}

// Unified helpers for easy role UI access
export type RoleContext = 'user' | 'application'

function normalizeRole(role: string | UserRole | ApplicationableRole): string {
  return (typeof role === 'string' ? role : String(role)).toLowerCase()
}

/**
 * Returns the icon component for a role, choosing mapping based on context.
 */
export function getIconComponentForRole(
  role: string | UserRole | ApplicationableRole,
  context: RoleContext = 'user'
): IconComponent {
  return context === 'application'
    ? getApplicationRoleIconComponent(role as ApplicationableRole)
    : getUserRoleIconComponent(role as UserRole)
}

/**
 * Returns the canonical color key for a role. Useful if you need custom styling.
 */
export function getRoleColorKey(role: string | UserRole | ApplicationableRole): keyof typeof COLOR_CLASSES {
  const key = normalizeRole(role)
  return ROLE_TO_COLOR[key] ?? 'gray'
}

/**
 * One-stop API: given a role, get its icon component and badge class builder.
 * Example usage:
 *   const ui = getRoleUI(user.role)
 *   <ui.Icon className="h-4 w-4" />
 *   <Badge className={ui.badgeClasses('soft')}>{ui.label}</Badge>
 */
export function getRoleUI(
  role: string | UserRole | ApplicationableRole,
  options?: { context?: RoleContext; variant?: BadgeVariant }
) {
  const { context = 'user', variant = 'soft' } = options ?? {}
  const key = normalizeRole(role)
  const Icon = getIconComponentForRole(role, context)
  const colorKey = getRoleColorKey(role)
  const label = key.charAt(0).toUpperCase() + key.slice(1)

  return {
    Icon,
    colorKey,
    label,
    badgeClasses: (v: BadgeVariant = variant) => COLOR_CLASSES[colorKey][v],
  }
}

/**
 * Returns a rendered icon element for the given role.
 * Defaults to the "user" context and a compact size.
 */
export function getRoleIcon(
  role: string | UserRole | ApplicationableRole,
  options?: { context?: RoleContext; className?: string }
) {
  const Icon = getIconComponentForRole(role, options?.context ?? 'user')
  return createElement(Icon, { className: options?.className ?? 'h-4 w-4' })
}
