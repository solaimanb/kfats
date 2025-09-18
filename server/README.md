# KFATS LMS Server

FastAPI backend for **Kushtia Finearts and Technology School** Learning Management System.

## 🏗️ Architecture Overview

This is a comprehensive LMS backend built with FastAPI that supports multiple user roles and educational platform features:

### User Roles & Permissions

- **👤 User** (default/visitor) - Basic access, can browse content
- **🎓 Student** - Can enroll in courses, track progress
- **👨‍🏫 Mentor** - Can create and manage courses
- **🛒 Seller** - Can create and sell art products
- **✍️ Writer** - Can create and publish articles/blogs
- **👑 Admin** - Full system access and management

### Key Features

- 🔐 **JWT Authentication** with role-based access control
- 👥 **Dynamic Role Upgrades** (e.g., user → student when enrolling)
- 📚 **Course Management** with enrollment system
- 📝 **Content Management** for articles/blogs
- 🛍️ **Marketplace** for art products
- 📊 **Progress Tracking** for student enrollments
- 🔒 **Secure API** with proper validation and error handling

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip or poetry

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database:**
   ```bash
   python seed_db.py
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── config.py          # Configuration settings
│   ├── database.py        # Database models and connection
│   ├── models.py          # Pydantic models
│   ├── auth.py           # Authentication utilities
│   ├── dependencies.py   # FastAPI dependencies
│   └── routers/          # API route handlers
│       ├── auth.py       # Authentication endpoints
│       ├── users.py      # User management
│       ├── courses.py    # Course management
│       ├── articles.py   # Article/blog management
│       └── products.py   # Product marketplace
├── main.py               # FastAPI application
├── seed_db.py           # Database seeding script
├── requirements.txt     # Python dependencies
└── .env.example        # Environment variables template
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/login/oauth` - OAuth2 compatible login
- `POST /api/v1/auth/role-upgrade` - Upgrade user role

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/` - List users (Admin only)
- `PUT /api/v1/users/{user_id}/role` - Update user role (Admin only)

### Courses
- `POST /api/v1/courses/` - Create course (Mentor/Admin)
- `GET /api/v1/courses/` - List published courses
- `GET /api/v1/courses/my-courses` - Get mentor's courses
- `POST /api/v1/courses/{course_id}/enroll` - Enroll in course
- `GET /api/v1/courses/{course_id}/enrollments` - Get course enrollments

### Articles
- `POST /api/v1/articles/` - Create article (Writer/Admin)
- `GET /api/v1/articles/` - List published articles
- `GET /api/v1/articles/my-articles` - Get writer's articles
- `PUT /api/v1/articles/{article_id}` - Update article

### Products
- `POST /api/v1/products/` - Create product (Seller/Admin)
- `GET /api/v1/products/` - List active products
- `GET /api/v1/products/my-products` - Get seller's products
- `PUT /api/v1/products/{product_id}` - Update product

## 🛡️ Security Features

- **JWT Token Authentication** with configurable expiration
- **Password Hashing** using bcrypt
- **Role-based Access Control** with dependency injection
- **Input Validation** using Pydantic models
- **CORS Configuration** for frontend integration
- **SQL Injection Protection** through SQLAlchemy ORM

## 🗄️ Database Schema

The system uses SQLAlchemy ORM with the following main entities:

- **Users** - User accounts with roles and authentication
- **Courses** - Educational courses with mentor relationships
- **Enrollments** - Student course enrollments with progress tracking
- **Articles** - Blog posts and articles with authorship
- **Products** - Marketplace items with seller relationships

## 🔧 Configuration

Key environment variables in `.env`:

```env
# Security
SECRET_KEY="your-secret-key"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL="sqlite:///./kfats.db"

# CORS
CORS_ORIGINS="http://localhost:3000"
```

## 📊 Default Users (Development)

After running `seed_db.py`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kfats.edu | admin123 |
| Mentor | mentor@kfats.edu | mentor123 |
| Student | student@kfats.edu | student123 |
| Writer | writer@kfats.edu | writer123 |
| Seller | seller@kfats.edu | seller123 |

⚠️ **Change these passwords in production!**

## 🚀 Deployment

### Using Render

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Using Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔄 Development Workflow

1. **Role Assignment Flow:**
   - Users register with default "user" role
   - Automatic role upgrade when performing role-specific actions
   - Admin can manually assign roles

2. **Course Enrollment Flow:**
   - Student browses published courses
   - Enrolls in course (auto-upgrades from "user" to "student")
   - Progress tracking throughout course

3. **Content Creation Flow:**
   - Writers create draft articles
   - Mentors create course content
   - Sellers list products
   - Admin oversight and management

## 🛠️ Development Commands

```bash
# Run server with auto-reload
uvicorn main:app --reload

# Reset and seed database
python seed_db.py

# Install dependencies
pip install -r requirements.txt

# Format code (if using black)
black app/ main.py

# Run tests (when implemented)
pytest
```

## 📈 Future Enhancements

- [ ] File upload system for course materials
- [ ] Payment integration for course purchases
- [ ] Email notifications and newsletters
- [ ] Advanced analytics and reporting
- [ ] Real-time chat/messaging system
- [ ] Mobile API optimizations
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing patterns
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the KFATS educational platform.
