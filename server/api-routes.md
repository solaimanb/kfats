## Authentication Routes (/api/v1/auth/):

```bash
POST /register - Register a new user
POST /login - User login
POST /forgot-password - Request password reset
POST /reset-password/:token - Reset password with token
POST /logout - Logout user (protected)
```

## OAuth Routes (/api/v1/gAuth/):

```bash
GET /google - Initiate Google OAuth
GET /google/callback - Google OAuth callback
GET /tokens - Get OAuth tokens
```

## User Routes (/api/v1/users/):

```bash
GET / - Get all users (admin only)
POST / - Create user (admin only)
GET /:id - Get user by ID (admin only)
PATCH /:id - Update user (admin only)
DELETE /:id - Delete user (admin only)
PATCH /profile - Update own profile
PATCH /password - Update own password
```

## Role Application Routes (/api/v1/role-applications/):

```bash
POST / - Submit role application
GET /my-applications - Get users applications
GET / - Get all applications (admin only)
GET /stats - Get application statistics (admin only)
GET /:id - Get application by ID (admin only)
PATCH /:id/approve - Approve application (admin only)
PATCH /:id/reject - Reject application (admin only)
POST /:id/verification-steps/:stepName - Update verification step (admin only)
```

## Course Routes (/api/v1/courses/):

```bash
GET / - Get all courses
POST /:id/rate - Rate a course
PATCH /:id - Update course (mentor only)
DELETE /:id - Delete course (mentor only)
PATCH /:id/publish - Publish course (mentor only)
PATCH /:id/unpublish - Unpublish course (mentor only)
```

## Category Routes (/api/v1/categories/):

```bash
GET / - Get all categories
POST / - Create category (admin only)
PATCH /:id - Update category (admin only)
DELETE /:id - Delete category (admin only)
```

## Permission Routes (/api/v1/permissions/):

```bash
GET /roles - Get all role permissions (admin only)
GET /roles/:role - Get specific role permissions (admin only)
PATCH /roles/:role - Update role permissions (admin only)
```
