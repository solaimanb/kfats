// User Types
export interface User {
  id: number
  email: string
  username: string
  full_name: string
  phone?: string
  bio?: string
  avatar_url?: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  last_login?: string
}

export enum UserRole {
  USER = "user",
  STUDENT = "student",
  MENTOR = "mentor",
  SELLER = "seller",
  WRITER = "writer",
  ADMIN = "admin"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending"
}

// Role Application Types
export enum ApplicationableRole {
  MENTOR = "mentor",
  SELLER = "seller",
  WRITER = "writer"
}

export enum RoleApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface RoleApplicationCreate {
  requested_role: ApplicationableRole
  reason: string
  application_data?: Record<string, unknown>
}

export interface RoleApplicationUpdate {
  status?: RoleApplicationStatus
  admin_notes?: string
}

export interface RoleApplication {
  id: number
  user_id: number
  requested_role: ApplicationableRole
  status: RoleApplicationStatus
  reason: string
  application_data?: Record<string, unknown>
  admin_notes?: string
  reviewed_by?: number
  applied_at: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  user?: User
  reviewed_by_user?: User
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  full_name: string
  password: string
  confirm_password: string
  role?: UserRole
  phone?: string
  bio?: string
  avatar_url?: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

// Course Types
export interface Course {
  id: number
  title: string
  description: string
  short_description?: string
  thumbnail_url?: string
  level: CourseLevel
  price: number
  duration_hours?: number
  max_students?: number
  status: CourseStatus
  mentor_id: number
  enrolled_count: number
  created_at: string
  updated_at: string
}

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export interface CourseCreate {
  title: string
  description: string
  short_description?: string
  thumbnail_url?: string
  level: CourseLevel
  price: number
  duration_hours?: number
  max_students?: number
}

// Enrollment Types
export interface Enrollment {
  id: number
  student_id: number
  course_id: number
  status: EnrollmentStatus
  progress_percentage: number
  enrolled_at: string
  completed_at?: string
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped",
  SUSPENDED = "suspended"
}

// Article Types
export interface Article {
  id: number
  title: string
  content: string
  excerpt?: string
  featured_image_url?: string
  tags?: string[]
  status: ArticleStatus
  author_id: number
  views_count: number
  created_at: string
  updated_at: string
  published_at?: string
}

export enum ArticleStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export interface ArticleCreate {
  title: string
  content: string
  excerpt?: string
  featured_image_url?: string
  tags?: string[]
}

// Product Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: ProductCategory
  image_urls?: string[]
  stock_quantity?: number
  status: ProductStatus
  seller_id: number
  created_at: string
  updated_at: string
}

export enum ProductCategory {
  PAINTING = "painting",
  SCULPTURE = "sculpture",
  DIGITAL_ART = "digital_art",
  PHOTOGRAPHY = "photography",
  CRAFTS = "crafts",
  OTHER = "other"
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock"
}

export interface ProductCreate {
  name: string
  description: string
  price: number
  category: ProductCategory
  image_urls?: string[]
  stock_quantity?: number
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error_code?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  username: string
  full_name: string
  password: string
  role?: UserRole
}

// Error Types
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: unknown
}
