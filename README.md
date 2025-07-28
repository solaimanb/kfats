# KFATS

A modern full-stack application built with Next.js frontend and FastAPI backend.

## 🚀 Overview

KFATS is a full-stack web application featuring:
- **Frontend**: Next.js 15 with TypeScript and Turbopack
- **Backend**: FastAPI with Python
- **Development**: Concurrent development environment with hot reload

## 📁 Project Structure

```
kfats/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   └── app/           # App Router pages and components
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies
│   └── README.md          # Client-specific documentation
├── server/                 # FastAPI backend application
│   ├── main.py            # FastAPI application entry point
│   ├── requirements.txt   # Python dependencies
│   ├── venv/              # Python virtual environment
│   └── README.md          # Server-specific documentation
├── package.json           # Root package.json for development scripts
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/solaimanb/kfats.git
cd kfats
```

### 2. Install Dependencies

```bash
# Install all dependencies (client + server)
npm run install:all
```

### 3. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## 📜 Available Scripts

### Root Level Commands

```bash
npm run dev                 # Start both client and server
npm run install:all         # Install all dependencies
npm run client:dev          # Start only the frontend
npm run server:dev          # Start only the backend
npm run client:build        # Build client for production
npm run client:start        # Start production client
npm run server:prod         # Start production server
```

### Individual Service Commands

#### Frontend (Client)
```bash
cd client
npm run dev                 # Development server
npm run build               # Production build
npm run start               # Production server
npm run lint                # Run ESLint
```

#### Backend (Server)
```bash
cd server
source venv/bin/activate    # Activate virtual environment
fastapi dev main.py         # Development server
fastapi run main.py         # Production server
pip install -r requirements.txt  # Install dependencies
```

## 🌐 Services

### Frontend (Next.js)
- **Development**: http://localhost:3000
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind (configurable)
- **Features**: 
  - Hot reload
  - Turbopack for faster builds
  - Optimized fonts (Geist)
  - Static generation support

### Backend (FastAPI)
- **Development**: http://127.0.0.1:8000
- **Production**: Deployed on Render
- **Framework**: FastAPI with Python
- **Features**:
  - Automatic API documentation
  - Type hints with Pydantic
  - Async/await support
  - Hot reload during development

## 📖 API Documentation

When the server is running, access the interactive API documentation:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
- **OpenAPI Schema**: http://127.0.0.1:8000/openapi.json

## 🚀 Deployment

### Frontend Deployment (Vercel - Recommended)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Deploy automatically on git push

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Language**: Python
   - **Root Directory**: `server`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🔧 Development Setup

### Manual Setup (Alternative)

#### 1. Setup Backend
```bash
cd server
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

#### 2. Setup Frontend
```bash
cd client
npm install
```

#### 3. Start Services
```bash
# Terminal 1 - Backend
cd server
source venv/bin/activate
fastapi dev main.py

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🌟 Features

### Current Features
- ✅ Full-stack development environment
- ✅ Hot reload for both frontend and backend
- ✅ Interactive API documentation
- ✅ TypeScript support
- ✅ Modern build tools (Turbopack)
- ✅ Production-ready deployment setup

### Planned Features
- 🔲 Database integration
- 🔲 Authentication system
- 🔲 API rate limiting
- 🔲 Unit and integration tests
- 🔲 Docker containerization
- 🔲 CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- **Frontend**: Follow ESLint configuration
- **Backend**: Follow PEP 8 guidelines
- Use TypeScript for type safety
- Add docstrings to Python functions
- Use meaningful commit messages

### Project Structure
- Keep client and server code separate
- Use absolute imports where possible
- Follow the established folder structure
- Update documentation when adding features

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or run into issues:

1. Check the individual README files in `client/` and `server/` directories
2. Look at the API documentation at `/docs` when the server is running
3. Create an issue in the GitHub repository

---