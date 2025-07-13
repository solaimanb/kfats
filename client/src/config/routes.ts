// Route configurations
export const ROUTES = {
  auth: ["/login", "/register", "/forgot-password", "/reset-password"],
  roleApplication: ["/role-application/become-mentor", "/role-application/become-seller", "/role-application/become-writer"],
  protected: ["/dashboard", "/dashboard/profile", "/settings"],
  admin: ["/dashboard/admin"]
} as const;

// Default landing pages by role
export const DEFAULT_REDIRECTS = {
  admin: "/dashboard/admin",
  mentor: "/dashboard/mentoring",
  writer: "/dashboard/articles",
  seller: "/dashboard/products",
  student: "/dashboard/courses",
  user: "/",
} as const;
