Auth Routes (auth.route.ts):
POST /api/v1/auth/register - Register new user
POST /api/v1/auth/login - Login user
POST /api/v1/auth/forgot-password - Request password reset
POST /api/v1/auth/reset-password/{token} - Reset password
GET /api/v1/auth/me - Get current user
POST /api/v1/auth/logout - Logout user
POST /api/v1/auth/refresh-token - Refresh access token
User Routes (user.route.ts):
GET /api/v1/users/profile - Get user profile
PATCH /api/v1/users/profile - Update profile
PATCH /api/v1/users/password - Update password
GET /api/v1/users - Get all users (Admin)
POST /api/v1/users - Create user (Admin)
GET /api/v1/users/{id} - Get specific user (Admin)
PATCH /api/v1/users/{id} - Update user (Admin)
DELETE /api/v1/users/{id} - Delete user (Admin)
Course Routes (course.route.ts):
GET /api/v1/courses - Get all courses
GET /api/v1/courses/{id} - Get course by ID
GET /api/v1/courses/enrolled - Get enrolled courses
POST /api/v1/courses/{id}/enroll - Enroll in course
POST /api/v1/courses/{id}/rate - Rate a course
POST /api/v1/courses - Create course (Mentor)
PATCH /api/v1/courses/{id} - Update course (Mentor)
DELETE /api/v1/courses/{id} - Delete course (Mentor)
PATCH /api/v1/courses/{id}/publish - Publish course (Mentor)
PATCH /api/v1/courses/{id}/unpublish - Unpublish course (Mentor)
Category Routes (category.route.ts):
GET /api/v1/categories - Get all categories
GET /api/v1/categories/{id} - Get category by ID
POST /api/v1/categories - Create category (Admin)
PATCH /api/v1/categories/{id} - Update category (Admin)
DELETE /api/v1/categories/{id} - Delete category (Admin)
Role Application Routes (role-application.route.ts):
POST /api/v1/role-applications - Submit application
GET /api/v1/role-applications/my-applications - Get user's applications
GET /api/v1/role-applications - Get all applications (Admin)
GET /api/v1/role-applications/{id} - Get application by ID (Admin)
PATCH /api/v1/role-applications/{id}/approve - Approve application (Admin)
PATCH /api/v1/role-applications/{id}/reject - Reject application (Admin)
Permission Routes (permission.route.ts):
GET /api/v1/permissions - Get all permissions (Admin)
GET /api/v1/permissions/roles - Get all role permissions (Admin)
GET /api/v1/permissions/roles/{role} - Get role permissions (Admin)
PATCH /api/v1/permissions/roles/{role} - Update role permissions (Admin)
OAuth Routes (oauth.route.ts):
GET /api/v1/gAuth/google - Initiate Google OAuth
GET /api/v1/gAuth/google/callback - Google OAuth callback
GET /api/v1/gAuth/tokens - Get OAuth tokens