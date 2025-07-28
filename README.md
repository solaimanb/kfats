# KFATS - Learning Management System

**Kushtia Fine Arts and Technology School** - A comprehensive, production-ready Learning Management System built with modern web technologies.

## 🚀 Overview

KFATS is an enterprise-grade full-stack LMS platform featuring:
- **Frontend**: Next.js 15 with TypeScript, React Query, and modern UI components
- **Backend**: FastAPI with PostgreSQL, JWT authentication, and role-based access control
- **Architecture**: Type-safe monorepo with comprehensive API integration
- **Security**: JWT authentication, bcrypt password hashing, and route protection
- **Database**: PostgreSQL with SQLAlchemy ORM and professional connection pooling
- **Development**: Concurrent development environment with hot reload and testing tools

## 📁 Project Architecture

```
kfats/
├── client/                          # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                    # App Router (Route Groups)
│   │   │   ├── (auth)/             # Authentication pages
│   │   │   ├── (protected)/        # Dashboard & protected routes
│   │   │   ├── (public)/           # Public landing pages
│   │   │   └── layout.tsx          # Root layout with providers
│   │   ├── components/ui/          # Reusable UI components (shadcn/ui)
│   │   ├── lib/
│   │   │   ├── api/                # Type-safe API client layer
│   │   │   ├── hooks/              # React Query hooks
│   │   │   ├── types/              # TypeScript definitions
│   │   │   └── constants/          # App constants
│   │   ├── providers/              # React Context providers
│   │   └── middleware.ts           # Route protection middleware
│   ├── public/                     # Static assets
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Client documentation
├── server/                         # FastAPI Backend Application
│   ├── app/
│   │   ├── routers/               # API route handlers
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   ├── users.py           # User management
│   │   │   ├── courses.py         # Course management
│   │   │   ├── articles.py        # Article/blog system
│   │   │   └── products.py        # Product marketplace
│   │   ├── models.py              # Pydantic data models
│   │   ├── database.py            # SQLAlchemy ORM models
│   │   ├── auth.py                # JWT authentication logic
│   │   ├── config.py              # Environment configuration
│   │   └── dependencies.py        # FastAPI dependencies
│   ├── test/                      # Database seeding & testing
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Server documentation
├── package.json                   # Root orchestration scripts
├── .gitignore                     # Git ignore rules
└── README.md                      # This comprehensive guide
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** 18+ with npm/yarn
- **Python** 3.8+
- **PostgreSQL** 12+ (local or cloud instance)
- **Git** for version control

### 1. Clone and Setup Environment

```bash
git clone https://github.com/solaimanb/kfats.git
cd kfats

# Install all dependencies (client + server)
npm run install:all
```

### 2. Backend Configuration

```bash
cd server

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your database credentials and secret keys
```

### 3. Database Setup

```bash
# Ensure PostgreSQL is running, then:
cd server

# Run the role management system migration
python migrate_role_system.py

# Or run manual database setup
python test/seed_db.py
```

### 4. Frontend Configuration

```bash
cd client

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API URL
```

### 5. Start Development Environment

```bash
# From root directory - starts both client and server
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (Next.js with Turbopack)
- **Backend**: http://127.0.0.1:8000 (FastAPI with auto-reload)
- **API Docs**: http://127.0.0.1:8000/docs (Interactive Swagger UI)
- **Database Admin**: Available through API endpoints

## 📜 Development Scripts

### Root Level Commands (Recommended)

```bash
npm run dev                 # Start both frontend and backend concurrently
npm run install:all         # Install all dependencies (client + server)
npm run client:dev          # Start only the Next.js frontend
npm run server:dev          # Start only the FastAPI backend
npm run client:build        # Build client for production
npm run client:start        # Start production client
npm run server:prod         # Start production server
```

### Frontend Commands (from `/client/`)

```bash
npm run dev                 # Development server with Turbopack
npm run build               # Production build with optimizations
npm run start               # Start production server
npm run lint                # Run ESLint with Next.js rules
npm run type-check          # TypeScript type checking
```

### Backend Commands (from `/server/`)

```bash
source venv/bin/activate    # Activate Python virtual environment
fastapi dev main.py         # Development server with auto-reload
fastapi run main.py         # Production server
python test/seed_db.py      # Seed database with initial data
python test/debug_config.py # Debug configuration issues
bash test/test_api.sh       # Run API endpoint tests
```

## 🌐 Application Services

### Frontend (Next.js 15)
- **Development**: http://localhost:3000
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict configuration
- **UI Library**: shadcn/ui components with Tailwind CSS v4
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: JWT with secure cookie storage
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toast notifications
- **Icons**: Lucide React icon library

### Backend (FastAPI)
- **Development**: http://127.0.0.1:8000
- **Framework**: FastAPI with Python 3.8+ and async/await
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic v2 for request/response validation
- **API Docs**: Auto-generated OpenAPI/Swagger documentation
- **CORS**: Configured for cross-origin requests
- **Security**: Role-based access control and input sanitization

### User Roles & Permissions
- **👤 User**: Basic access, can browse content
- **🎓 Student**: Auto-assigned on course enrollment, can access enrolled courses
- **👨‍🏫 Mentor**: Admin-approved role, create and manage courses, teach students
- **✍️ Writer**: Admin-approved role, create and publish articles, manage content
- **🛒 Seller**: Admin-approved role, list and manage products in marketplace
- **👨‍💼 Admin**: Full system access, user management, role applications, analytics

### Role Management System

#### **Role Upgrade Workflows**

**🔄 Automatic Upgrades:**
- **User → Student**: Triggered automatically when enrolling in any course
- **Implementation**: Backend automatically updates role during course enrollment
- **No approval required**: Seamless user experience

**📝 Application-Based Upgrades:**
- **User/Student → Mentor/Writer/Seller**: Requires formal application and admin approval
- **Application Process**: 
  1. User submits application with detailed reason and supporting information
  2. Admin reviews application in dashboard
  3. Admin approves or rejects with feedback notes
  4. User receives notification of decision
- **Security Features**:
  - 30-day cooldown period after rejection before reapplication
  - Duplicate application prevention
  - Complete audit trail of all role changes

#### **Role Application API Endpoints (`/api/v1/role-applications/`)**
- `POST /apply` - Submit new role application
- `GET /my-applications` - Get current user's applications  
- `GET /` - Get all applications (admin only, with pagination)
- `PUT /{id}/review` - Review application (admin only)
- `DELETE /{id}` - Withdraw pending application
- `GET /stats` - Get application statistics (admin only)

#### **Access Control & Security**
- **Route Protection**: Role-based middleware on both frontend and backend
- **JWT Validation**: Secure token-based authentication with automatic refresh
- **Permission Hierarchy**: Admin role has access to all features
- **Audit Logging**: Complete tracking of role changes and admin actions
- **Input Validation**: Comprehensive sanitization and schema validation

## 📖 API Documentation & Testing

### Interactive Documentation
When the server is running, access comprehensive API documentation:

- **Swagger UI**: http://127.0.0.1:8000/docs (Interactive testing interface)
- **ReDoc**: http://127.0.0.1:8000/redoc (Clean documentation view)
- **OpenAPI Schema**: http://127.0.0.1:8000/openapi.json (Raw schema)

### API Endpoints Overview

#### Authentication (`/api/v1/auth/`)
- `POST /register` - User registration with role selection
- `POST /login` - User authentication
- `POST /logout` - Secure logout
- `GET /me` - Get current user profile
- `PUT /upgrade-role` - Upgrade user role (student → mentor, etc.)

#### User Management (`/api/v1/users/`)
- `GET /` - List users (admin only, with pagination)
- `GET /{user_id}` - Get user profile
- `PUT /{user_id}` - Update user profile
- `DELETE /{user_id}` - Delete user (admin only)

#### Course Management (`/api/v1/courses/`)
- `GET /` - List courses (with filtering and search)
- `POST /` - Create course (mentor only)
- `GET /{course_id}` - Get course details
- `PUT /{course_id}` - Update course (mentor only)
- `POST /{course_id}/enroll` - Enroll in course
- `GET /my-courses` - Get mentor's courses

#### Content Management (`/api/v1/articles/`, `/api/v1/products/`)
- Complete CRUD operations for articles and products
- Role-based access control
- Search and filtering capabilities

### Testing Credentials
After running the database seed script:
```
Admin User:
- Email: admin@kfats.edu
- Password: admin123

Test the authentication flow and explore all features!
```

## 🚀 Production Deployment

### Environment Variables

#### Backend (`.env`)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/kfats_db

# Security
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Application
APP_NAME=KFATS LMS API
DEBUG=false
```

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# or for production:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Frontend Deployment (Vercel - Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**:
   - Framework Preset: `Next.js`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Environment Variables**: Add your production environment variables
4. **Deploy**: Automatic deployment on git push

### Backend Deployment Options

#### Option 1: Railway/Render (Recommended)
1. **Create Service**: Connect your GitHub repository
2. **Configuration**:
   - Root Directory: `server`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Database**: Use managed PostgreSQL service
4. **Environment Variables**: Configure production variables

#### Option 2: Docker Deployment
```dockerfile
# server/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Database Migration
For production, ensure your PostgreSQL instance is configured with:
- Connection pooling
- SSL enabled
- Regular backups
- Performance monitoring

## 🔧 Advanced Development

### Technology Stack

#### **Frontend Stack**
```json
{
  "framework": "Next.js 15",
  "language": "TypeScript",
  "ui": "shadcn/ui + Tailwind CSS v4",
  "state": "React Query (TanStack Query)",
  "forms": "React Hook Form + Zod",
  "http": "Axios with interceptors",
  "icons": "Lucide React",
  "notifications": "Sonner"
}
```

#### **Backend Stack**
```python
{
    "framework": "FastAPI",
    "database": "PostgreSQL + SQLAlchemy 2.0",
    "authentication": "JWT + bcrypt",
    "validation": "Pydantic v2",
    "server": "Uvicorn ASGI",
    "environment": "Pydantic Settings"
}
```

### Code Quality & Standards

#### **Frontend Standards**
- **ESLint**: Next.js recommended rules + custom configurations
- **TypeScript**: Strict mode with comprehensive type coverage
- **Components**: Modular, reusable component architecture
- **Hooks**: Custom React Query hooks for API integration
- **State**: Server state with React Query, client state with React

#### **Backend Standards**
- **PEP 8**: Python code style guidelines
- **Type Hints**: Comprehensive type annotations
- **Async/Await**: Modern async patterns throughout
- **Error Handling**: Centralized error responses
- **Documentation**: Auto-generated API documentation

#### **Database Guidelines**
- Use SQLAlchemy ORM patterns
- Implement proper foreign key relationships
- Use database migrations for schema changes
- Follow PostgreSQL best practices

#### **Testing Strategy**
```bash
# Backend testing
cd server
python test/debug_config.py      # Configuration testing
python test/seed_db.py           # Database seeding
bash test/test_api.sh            # API endpoint testing

# Frontend testing (ready for implementation)
cd client
npm run test                     # Unit tests with Jest
npm run test:e2e                 # E2E tests with Playwright
npm run type-check              # TypeScript validation
```

## 🌟 Key Features

### ✅ **Completed Implementation**

#### **🔐 Authentication & Security**
- JWT-based authentication with secure cookie storage
- Role-based access control (6 user roles)
- Password hashing with bcrypt
- Route protection middleware
- Automatic token refresh and validation

#### **🎓 Learning Management System**
- **Course Management**: Create, edit, and manage courses
- **Student Enrollment**: Course enrollment and progress tracking
- **Mentor Dashboard**: Analytics and student management
- **Content Creation**: Rich text articles and course materials

#### **🛒 Marketplace Features**
- **Product Listings**: Sellers can list creative products
- **Inventory Management**: Stock tracking and management
- **User Profiles**: Comprehensive profile management

#### **💻 Technical Excellence**
- **Type Safety**: 100% TypeScript coverage
- **API Integration**: Comprehensive REST API with React Query
- **Responsive Design**: Mobile-first UI with shadcn/ui components
- **Real-time Updates**: Optimistic updates and cache management
- **Error Handling**: Comprehensive error boundaries and user feedback

#### **🎨 User Experience**
- **Role-Based Dashboards**: Customized interfaces for each user type
- **Interactive Forms**: React Hook Form with Zod validation
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth loading and error states

### 🚧 **Planned Enhancements**

#### **📁 File Management**
- Profile picture uploads
- Course material file attachments
- Product image galleries
- Document storage system

#### **💰 Payment Integration**
- Course enrollment payments
- Product purchase system
- Instructor payouts
- Subscription management

#### **📊 Analytics & Reporting**
- Student progress analytics
- Course performance metrics
- Revenue reporting
- User engagement tracking

#### **🔔 Real-time Features**
- WebSocket notifications
- Live chat support
- Real-time collaboration
- Instant messaging system

#### **📱 Mobile & Progressive**
- React Native mobile app
- Progressive Web App (PWA)
- Offline functionality
- Push notifications

## 📋 Documentation

### Core Guides
- **[Role Management System](./ROLE_MANAGEMENT.md)** - Comprehensive guide to user roles, applications, and access control
- **[API Integration Guide](./client/API_INTEGRATION_STATUS.md)** - Frontend API integration patterns and best practices
- **[Database Schema](./server/README.md)** - Database models, relationships, and migration guides
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions and configurations

### Quick References
- **[Backend API Docs](http://127.0.0.1:8000/docs)** - Interactive Swagger/OpenAPI documentation
- **[Frontend Component Library](http://localhost:3000/components)** - UI component showcase and examples
- **[Authentication Flow](./docs/auth-flow.md)** - JWT authentication implementation details
- **[Role-Based Access Control](./docs/rbac.md)** - Permissions matrix and security model

### Testing Documentation
- **Role Management Testing**: `./test_role_system.sh` - Complete role upgrade workflow testing
- **API Endpoint Testing**: `./server/test/test_api.sh` - Backend API functionality verification
- **Frontend Testing**: Component tests and E2E testing with Playwright
- **Database Testing**: Migration scripts and data integrity verification

## 🤝 Contributing

We welcome contributions to KFATS! Here's how to get started:

### Development Workflow

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Set up development environment** (see Quick Start guide)
4. **Make your changes** following our coding standards
5. **Test thoroughly**:
   ```bash
   # Test backend
   cd server && bash test/test_api.sh
   
   # Test frontend
   cd client && npm run build && npm run lint
   ```
6. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat: add user profile image upload functionality"
   ```
7. **Push to your fork** and create a Pull Request

### Coding Standards

#### **Frontend Guidelines**
- Use TypeScript with strict mode
- Follow React Hook patterns and best practices
- Implement proper error boundaries
- Use React Query for all API calls
- Follow shadcn/ui component patterns
- Write self-documenting code with meaningful names

#### **Backend Guidelines**
- Follow PEP 8 and use type hints throughout
- Use async/await for database operations
- Implement proper error handling with FastAPI HTTPException
- Write comprehensive docstrings for all functions
- Use Pydantic models for request/response validation
- Follow RESTful API design principles

#### **Commit Message Convention**
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

#### **Pull Request Process**

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure CI passes** (linting, type checking, tests)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** before merging (if requested)

## 📝 Project Guidelines

### Development Best Practices

#### **Code Organization**
- **Monorepo Structure**: Keep client and server code clearly separated
- **Absolute Imports**: Use path mapping for cleaner imports
- **Component Structure**: Organized by feature, not by file type
- **API Layer**: Centralized API logic with proper error handling

#### **Performance Optimization**
- **React Query**: Implement proper caching strategies
- **Next.js**: Utilize App Router and Server Components
- **Database**: Use connection pooling and proper indexing
- **Images**: Optimize with Next.js Image component

#### **Security Considerations**
- **JWT Tokens**: Secure storage and automatic refresh
- **Input Validation**: Client and server-side validation
- **CORS**: Properly configured for production
- **Environment Variables**: Never commit sensitive data

#### **Accessibility**
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Implement for screen readers
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Color Contrast**: Follow WCAG guidelines

### Project Roadmap

#### **Phase 1: Core LMS (✅ Completed)**
- User authentication and role management
- Course creation and enrollment system
- Basic dashboard functionality
- Article/blog content management
- Product marketplace foundation

#### **Phase 2: Enhanced Features (🚧 In Progress)**
- File upload and media management
- Payment integration for courses/products
- Advanced user profiles and settings
- Notification system implementation

#### **Phase 3: Advanced Analytics (📋 Planned)**
- Learning progress tracking
- Comprehensive reporting dashboard
- Revenue and sales analytics
- User engagement metrics

#### **Phase 4: Mobile & Real-time (🔮 Future)**
- React Native mobile application
- Real-time chat and notifications
- Offline functionality
- Progressive Web App features

### Support & Community

#### **Getting Help**
1. **Documentation**: Check the comprehensive README files in `/client/` and `/server/`
2. **API Documentation**: Visit http://127.0.0.1:8000/docs when running locally
3. **Issues**: Create a GitHub issue with detailed description
4. **Discussions**: Use GitHub Discussions for questions and ideas

#### **Useful Resources**
- **Next.js 15**: [Official Documentation](https://nextjs.org/docs)
- **FastAPI**: [Framework Documentation](https://fastapi.tiangolo.com/)
- **React Query**: [TanStack Query Docs](https://tanstack.com/query/latest)
- **TypeScript**: [Language Documentation](https://www.typescriptlang.org/docs/)
- **Pydantic**: [Validation Library](https://docs.pydantic.dev/)
- **SQLAlchemy**: [ORM Documentation](https://docs.sqlalchemy.org/)
- **PostgreSQL**: [Database Documentation](https://www.postgresql.org/docs/)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability or warranty provided

---

## 🙋‍♂️ Support & Maintenance

**KFATS** is actively maintained and developed. For support:

### **Immediate Help**
- 📚 Check `/client/README.md` and `/server/README.md` for specific setup guides
- 🔧 Visit http://127.0.0.1:8000/docs for interactive API testing
- 🐛 Search existing [GitHub Issues](https://github.com/solaimanb/kfats/issues)

### **Community Support**
- 💬 Join [GitHub Discussions](https://github.com/solaimanb/kfats/discussions)
- 🎯 Create [Feature Requests](https://github.com/solaimanb/kfats/issues/new?template=feature_request.md)
- 🐛 Report [Bug Reports](https://github.com/solaimanb/kfats/issues/new?template=bug_report.md)

### **Professional Support**
For enterprise implementations, custom development, or consulting services, please contact the maintainers directly.

---

<div align="center">

**Built with ❤️ for the educational community**

**⭐ Star this repository if you find it helpful!**

[🌐 Live Demo](https://kfats.vercel.app) | [📖 Documentation](./docs) | [🚀 Getting Started](#-quick-start) | [🤝 Contributing](#-contributing)

</div>