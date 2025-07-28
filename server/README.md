# KFATS Server

A FastAPI backend server for the KFATS application.

## Overview

This is the backend API server built with FastAPI that provides RESTful endpoints for the KFATS application.

## Features

- FastAPI framework for high-performance API development
- Automatic interactive API documentation
- Hot reload during development
- Type hints and validation with Pydantic

## Prerequisites

- Python 3.8+
- pip (Python package installer)

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate     # On Windows
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Development Mode
```bash
fastapi dev main.py
```

This will start the server at `http://127.0.0.1:8000` with hot reload enabled.

### Production Mode
```bash
fastapi run main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs (Swagger UI)**: http://127.0.0.1:8000/docs
- **Alternative API Docs (ReDoc)**: http://127.0.0.1:8000/redoc
- **OpenAPI Schema**: http://127.0.0.1:8000/openapi.json

## API Endpoints

### Root Endpoint
- **GET** `/` - Returns a welcome message

## Project Structure

```
server/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── venv/               # Virtual environment (created after setup)
```

## Development

### Adding New Dependencies

1. Install the package:
   ```bash
   pip install package-name
   ```

2. Update requirements.txt:
   ```bash
   pip freeze > requirements.txt
   ```

### Code Style

- Follow PEP 8 style guidelines
- Use type hints for better code documentation
- Add docstrings to functions and classes

## Environment Variables

Create a `.env` file in the server directory for environment-specific configurations:

```env
# Example environment variables
DEBUG=True
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
```

## Testing

To run tests (when test files are added):

```bash
pytest
```

## Deployment

For production deployment, consider:

1. Using a production WSGI server like Gunicorn
2. Setting up environment variables
3. Configuring a reverse proxy (nginx)
4. Setting up SSL certificates
5. Using a proper database instead of SQLite

Example production command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]
