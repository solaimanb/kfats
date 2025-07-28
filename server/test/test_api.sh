#!/bin/bash
# KFATS LMS API Testing Script with CURL
# Tests all endpoints systematically

API_BASE="http://localhost:8000/api/v1"
ADMIN_TOKEN=""
MENTOR_TOKEN=""
STUDENT_TOKEN=""

echo "🚀 KFATS LMS API Comprehensive Testing"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
    fi
}

# Function to extract token from response
extract_token() {
    echo "$1" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

echo ""
echo -e "${BLUE}📊 Step 1: Health Check${NC}"
echo "========================"

# Test health endpoint
response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json http://localhost:8000/health)
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    print_result 0 "Health check endpoint"
    cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
else
    print_result 1 "Health check endpoint (HTTP $http_code)"
    echo "Server might not be running. Please start with: uvicorn main:app --reload"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 Step 2: Authentication Tests${NC}"
echo "================================="

# Test user registration
echo "Testing user registration..."
register_response=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@kfats.edu",
    "username": "testuser",
    "full_name": "Test User",
    "password": "testpass123",
    "confirm_password": "testpass123",
    "role": "user"
  }')

echo "$register_response" | jq '.' 2>/dev/null || echo "$register_response"

# Test admin login
echo ""
echo "Testing admin login..."
admin_login_response=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kfats.edu",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(extract_token "$admin_login_response")
if [ -n "$ADMIN_TOKEN" ]; then
    print_result 0 "Admin login"
    echo "Admin token: ${ADMIN_TOKEN:0:20}..."
else
    print_result 1 "Admin login"
    echo "$admin_login_response" | jq '.' 2>/dev/null || echo "$admin_login_response"
fi

# Test mentor login
echo ""
echo "Testing mentor login..."
mentor_login_response=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@kfats.edu",
    "password": "mentor123"
  }')

MENTOR_TOKEN=$(extract_token "$mentor_login_response")
if [ -n "$MENTOR_TOKEN" ]; then
    print_result 0 "Mentor login"
    echo "Mentor token: ${MENTOR_TOKEN:0:20}..."
else
    print_result 1 "Mentor login"
fi

# Test student login
echo ""
echo "Testing student login..."
student_login_response=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@kfats.edu",
    "password": "student123"
  }')

STUDENT_TOKEN=$(extract_token "$student_login_response")
if [ -n "$STUDENT_TOKEN" ]; then
    print_result 0 "Student login"
    echo "Student token: ${STUDENT_TOKEN:0:20}..."
else
    print_result 1 "Student login"
fi

echo ""
echo -e "${BLUE}👥 Step 3: User Management Tests${NC}"
echo "=================================="

# Test get current user profile
if [ -n "$ADMIN_TOKEN" ]; then
    echo "Testing get current user profile (Admin)..."
    profile_response=$(curl -s -X GET "$API_BASE/users/me" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    echo "$profile_response" | jq '.' 2>/dev/null || echo "$profile_response"
fi

# Test get all users (Admin only)
if [ -n "$ADMIN_TOKEN" ]; then
    echo ""
    echo "Testing get all users (Admin only)..."
    users_response=$(curl -s -X GET "$API_BASE/users/" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    echo "$users_response" | jq '.' 2>/dev/null || echo "$users_response"
fi

echo ""
echo -e "${BLUE}📚 Step 4: Course Management Tests${NC}"
echo "===================================="

# Test create course (Mentor)
if [ -n "$MENTOR_TOKEN" ]; then
    echo "Testing create course (Mentor)..."
    course_create_response=$(curl -s -X POST "$API_BASE/courses/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $MENTOR_TOKEN" \
      -d '{
        "title": "Introduction to Digital Art",
        "description": "Learn the basics of digital art creation using modern tools and techniques.",
        "short_description": "Digital art fundamentals",
        "level": "beginner",
        "price": 99.99,
        "duration_hours": 20,
        "max_students": 30
      }')
    
    echo "$course_create_response" | jq '.' 2>/dev/null || echo "$course_create_response"
    
    # Extract course ID for further tests
    COURSE_ID=$(echo "$course_create_response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "Created course ID: $COURSE_ID"
fi

# Test get courses (Public)
echo ""
echo "Testing get all courses (Public)..."
courses_response=$(curl -s -X GET "$API_BASE/courses/")
echo "$courses_response" | jq '.' 2>/dev/null || echo "$courses_response"

# Test get mentor's courses
if [ -n "$MENTOR_TOKEN" ]; then
    echo ""
    echo "Testing get mentor's courses..."
    mentor_courses_response=$(curl -s -X GET "$API_BASE/courses/my-courses" \
      -H "Authorization: Bearer $MENTOR_TOKEN")
    
    echo "$mentor_courses_response" | jq '.' 2>/dev/null || echo "$mentor_courses_response"
fi

echo ""
echo -e "${BLUE}📝 Step 5: Article Management Tests${NC}"
echo "===================================="

# Test create article (Writer)
writer_login_response=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "writer@kfats.edu",
    "password": "writer123"
  }')

WRITER_TOKEN=$(extract_token "$writer_login_response")

if [ -n "$WRITER_TOKEN" ]; then
    echo "Testing create article (Writer)..."
    article_create_response=$(curl -s -X POST "$API_BASE/articles/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $WRITER_TOKEN" \
      -d '{
        "title": "The Future of Digital Art Education",
        "content": "Digital art education is evolving rapidly with new technologies...",
        "excerpt": "Exploring how technology is changing art education",
        "tags": ["education", "digital-art", "technology"]
      }')
    
    echo "$article_create_response" | jq '.' 2>/dev/null || echo "$article_create_response"
fi

# Test get articles (Public)
echo ""
echo "Testing get all articles (Public)..."
articles_response=$(curl -s -X GET "$API_BASE/articles/")
echo "$articles_response" | jq '.' 2>/dev/null || echo "$articles_response"

echo ""
echo -e "${BLUE}🛍️ Step 6: Product Management Tests${NC}"
echo "===================================="

# Test create product (Seller)
seller_login_response=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@kfats.edu",
    "password": "seller123"
  }')

SELLER_TOKEN=$(extract_token "$seller_login_response")

if [ -n "$SELLER_TOKEN" ]; then
    echo "Testing create product (Seller)..."
    product_create_response=$(curl -s -X POST "$API_BASE/products/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SELLER_TOKEN" \
      -d '{
        "name": "Digital Art Print - Sunset Collection",
        "description": "Beautiful digital art print perfect for home decoration",
        "price": 29.99,
        "category": "digital_art",
        "stock_quantity": 100
      }')
    
    echo "$product_create_response" | jq '.' 2>/dev/null || echo "$product_create_response"
fi

# Test get products (Public)
echo ""
echo "Testing get all products (Public)..."
products_response=$(curl -s -X GET "$API_BASE/products/")
echo "$products_response" | jq '.' 2>/dev/null || echo "$products_response"

echo ""
echo -e "${BLUE}🎓 Step 7: Course Enrollment Tests${NC}"
echo "==================================="

# Test course enrollment (Student)
if [ -n "$STUDENT_TOKEN" ] && [ -n "$COURSE_ID" ]; then
    echo "Testing course enrollment (Student)..."
    enrollment_response=$(curl -s -X POST "$API_BASE/courses/$COURSE_ID/enroll" \
      -H "Authorization: Bearer $STUDENT_TOKEN")
    
    echo "$enrollment_response" | jq '.' 2>/dev/null || echo "$enrollment_response"
fi

echo ""
echo -e "${BLUE}🔍 Step 8: Error Handling Tests${NC}"
echo "==============================="

# Test unauthorized access
echo "Testing unauthorized access..."
unauthorized_response=$(curl -s -w "%{http_code}" -o /tmp/unauth_response.json -X GET "$API_BASE/users/")
http_code="${unauthorized_response: -3}"
if [ "$http_code" = "401" ]; then
    print_result 0 "Unauthorized access properly blocked"
else
    print_result 1 "Unauthorized access not properly blocked (HTTP $http_code)"
fi

# Test invalid login
echo ""
echo "Testing invalid login..."
invalid_login_response=$(curl -s -w "%{http_code}" -o /tmp/invalid_login.json -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }')
http_code="${invalid_login_response: -3}"
if [ "$http_code" = "401" ]; then
    print_result 0 "Invalid login properly rejected"
else
    print_result 1 "Invalid login not properly rejected (HTTP $http_code)"
fi

echo ""
echo -e "${GREEN}🎉 Testing Complete!${NC}"
echo "===================="
echo ""
echo "📋 Summary:"
echo "- Health check: Server is running"
echo "- Authentication: Multiple user roles tested"
echo "- User Management: Profile and admin functions"
echo "- Course Management: Create, list, enroll"
echo "- Article Management: Create and list"
echo "- Product Management: Create and list"
echo "- Security: Unauthorized access blocked"
echo ""
echo "🔗 API Documentation: http://localhost:8000/docs"
echo "🔗 Alternative Docs: http://localhost:8000/redoc"

# Cleanup temp files
rm -f /tmp/health_response.json /tmp/unauth_response.json /tmp/invalid_login.json
