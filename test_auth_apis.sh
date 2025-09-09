#!/bin/bash

# KFATS AUTH API Testing Script - Simplified Version
# Testing core AUTH endpoints that are working

BASE_URL="http://localhost:8000/api/v1"
echo "🚀 Starting KFATS AUTH API Testing (Simplified)"
echo "Base URL: $BASE_URL"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TEST_COUNT=0
PASSED=0
FAILED=0

# Function to print test results
print_test() {
    local test_name="$1"
    local status="$2"
    local response="$3"

    TEST_COUNT=$((TEST_COUNT + 1))

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        FAILED=$((FAILED + 1))
        if [ -n "$response" ]; then
            echo -e "${RED}   Response: $response${NC}"
        fi
    fi
}

# Function to make curl request and check response
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local auth_header="$5"
    local test_name="$6"
    local content_type="${7:-application/json}"

    local curl_cmd="curl -s -w 'HTTPSTATUS:%{http_code};' -X $method '$BASE_URL$endpoint'"

    if [ -n "$data" ]; then
        if [ "$content_type" = "application/x-www-form-urlencoded" ]; then
            curl_cmd="$curl_cmd -H 'Content-Type: $content_type' -d '$data'"
        elif [ -f "$data" ]; then
            curl_cmd="$curl_cmd -H 'Content-Type: $content_type' -d '@$data'"
        else
            curl_cmd="$curl_cmd -H 'Content-Type: $content_type' -d '$data'"
        fi
    fi

    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_header'"
    fi

    # Execute curl command
    local response=$(eval $curl_cmd)
    local http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    local body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')

    # Clean up the HTTP code (remove extra characters)
    http_code=$(echo "$http_code" | sed 's/[^0-9]*//g' | cut -c1-3)

    if [ "$http_code" = "$expected_status" ]; then
        print_test "$test_name" "PASS"
        echo "$body" > /tmp/last_response.json
        return 0
    else
        print_test "$test_name" "FAIL" "HTTP $http_code: $body"
        return 1
    fi
}

# Generate unique test data
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"

echo -e "${YELLOW}📋 Test Data:${NC}"
echo "Email: $TEST_EMAIL"
echo "Username: $TEST_USERNAME"
echo "========================================"

echo -e "\n${BLUE}📝 PHASE 1: USER REGISTRATION TESTS${NC}"
echo "========================================"

# Test 1: Valid user registration
cat > /tmp/register_payload.json << EOF
{
    "email": "$TEST_EMAIL",
    "username": "$TEST_USERNAME",
    "full_name": "Test User",
    "phone": "+1234567890",
    "bio": "Test bio",
    "password": "TestPass123!",
    "confirm_password": "TestPass123!"
}
EOF
test_endpoint "POST" "/auth/register" "/tmp/register_payload.json" "200" "" "Valid user registration"

# Test 2: Password mismatch registration
cat > /tmp/password_mismatch.json << EOF
{
    "email": "mismatch${TIMESTAMP}@example.com",
    "username": "mismatchuser",
    "full_name": "Mismatch User",
    "password": "TestPass123!",
    "confirm_password": "DifferentPass123!"
}
EOF
test_endpoint "POST" "/auth/register" "/tmp/password_mismatch.json" "400" "" "Password mismatch registration (should fail)"

# Test 3: Missing required fields
test_endpoint "POST" "/auth/register" '{"email": "incomplete@example.com"}' "422" "" "Missing required fields (should fail)"

echo -e "\n${BLUE}🔐 PHASE 2: USER LOGIN TESTS${NC}"
echo "========================================"

# Test 4: Valid login
test_endpoint "POST" "/auth/login" "/tmp/register_payload.json" "200" "" "Valid user login"

# Extract access token from login response
if [ -f /tmp/last_response.json ]; then
    ACCESS_TOKEN=$(cat /tmp/last_response.json | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ACCESS_TOKEN" ]; then
        echo -e "${YELLOW}🔑 Access Token: ${ACCESS_TOKEN:0:50}...${NC}"
    fi
fi

# Test 5: Invalid email login
cat > /tmp/invalid_login.json << EOF
{
    "email": "nonexistent@example.com",
    "password": "TestPass123!"
}
EOF
test_endpoint "POST" "/auth/login" "/tmp/invalid_login.json" "401" "" "Invalid email login (should fail)"

# Test 6: Wrong password login
cat > /tmp/wrong_password.json << EOF
{
    "email": "$TEST_EMAIL",
    "password": "WrongPass123!"
}
EOF
test_endpoint "POST" "/auth/login" "/tmp/wrong_password.json" "401" "" "Wrong password login (should fail)"

echo -e "\n${BLUE}🔒 PHASE 3: PASSWORD MANAGEMENT TESTS${NC}"
echo "========================================"

# Test 7: Forgot password (valid email)
test_endpoint "POST" "/password/forgot" "{\"email\": \"$TEST_EMAIL\"}" "200" "" "Forgot password with valid email"

# Test 8: Forgot password (invalid email)
test_endpoint "POST" "/password/forgot" '{"email": "nonexistent@example.com"}' "200" "" "Forgot password with invalid email"

# Test 9: Password reset with invalid token
test_endpoint "POST" "/password/reset" '{
    "token": "invalid_token_12345",
    "new_password": "ResetPass123!",
    "confirm_new_password": "ResetPass123!"
}' "400" "" "Password reset with invalid token (should fail)"

echo -e "\n${BLUE}🚫 PHASE 4: UNAUTHORIZED ACCESS TESTS${NC}"
echo "========================================"

# Test 10: Access protected endpoint without token
test_endpoint "POST" "/auth/role-upgrade" '{"new_role": "student"}' "403" "" "Access protected endpoint without token (should fail)"

# Test 11: Access password change without token
test_endpoint "POST" "/password/change" '{
    "current_password": "TestPass123!",
    "new_password": "NewPass123!",
    "confirm_new_password": "NewPass123!"
}' "403" "" "Access password change without token (should fail)"

echo -e "\n${BLUE}� PHASE 5: AUTHENTICATED TESTS${NC}"
echo "========================================"

# Test authenticated endpoints if we have a token
if [ -n "$ACCESS_TOKEN" ]; then
    # Test 12: Role upgrade (requires authentication)
    test_endpoint "POST" "/auth/role-upgrade" '{"new_role": "student"}' "200" "$ACCESS_TOKEN" "Role upgrade to student"

    # Test 13: Invalid role upgrade
    test_endpoint "POST" "/auth/role-upgrade" '{"new_role": "admin"}' "400" "$ACCESS_TOKEN" "Invalid role upgrade (should fail)"

    # Test 14: Password change
    test_endpoint "POST" "/password/change" '{
        "current_password": "TestPass123!",
        "new_password": "NewTestPass123!",
        "confirm_new_password": "NewTestPass123!"
    }' "200" "$ACCESS_TOKEN" "Password change"

    # Test 15: Password change with wrong current password
    test_endpoint "POST" "/password/change" '{
        "current_password": "WrongPass123!",
        "new_password": "NewTestPass123!",
        "confirm_new_password": "NewTestPass123!"
    }' "400" "$ACCESS_TOKEN" "Password change with wrong current password (should fail)"
else
    echo -e "${RED}⚠️  Skipping authenticated tests - no access token available${NC}"
fi

echo -e "\n${GREEN}🎉 TESTING COMPLETE${NC}"
echo "========================================"
echo -e "${BLUE}📈 SUMMARY:${NC}"
echo "Total Tests: $TEST_COUNT"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎊 ALL TESTS PASSED! AUTH APIs are working correctly.${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please review the failed tests above.${NC}"
fi

# Cleanup
rm -f /tmp/*.json
