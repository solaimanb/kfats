#!/bin/bash

# KFATS COMPREHENSIVE AUTHENTICATION TEST SUITE - ENHANCED VERSION
# Tests ALL authentication endpoints and authorization scenarios A-Z
# Enhanced with better error handling, debugging, and comprehensive coverage

set +e  # Don't exit on errors - we want to see all test results

# Configuration
API_BASE="http://127.0.0.1:8000/api/v1"
HEALTH_ENDPOINT="http://127.0.0.1:8000/health"
TEST_TIMESTAMP=$(date +%s)
LOG_FILE="kfats_auth_test_${TEST_TIMESTAMP}.log"
VERBOSE_MODE="${VERBOSE:-false}"
SKIP_CLEANUP="${SKIP_CLEANUP:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YIGHLLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# User credentials for testing
declare -A TEST_USERS=(
    ["admin"]="admin@kfats.edu:admin123"
    ["mentor"]="mentor@kfats.edu:mentor123"
    ["student"]="student@kfats.edu:student123"
    ["writer"]="writer@kfats.edu:writer123"
    ["seller"]="seller@kfats.edu:seller123"
    ["testuser1"]="testuser1_${TEST_TIMESTAMP}@kfats.edu:TestPass123!"
    ["testuser2"]="testuser2_${TEST_TIMESTAMP}@kfats.edu:TestPass123!"
    ["testuser3"]="testuser3_${TEST_TIMESTAMP}@kfats.edu:TestPass123!"
    ["testuser4"]="testuser4_${TEST_TIMESTAMP}@kfats.edu:TestPass123!"
    ["testuser5"]="testuser5_${TEST_TIMESTAMP}@kfats.edu:TestPass123!"
)

# Store tokens for each user
declare -A USER_TOKENS

# Global variables for test resources
TEST_COURSE_ID=""
TEST_ARTICLE_ID=""
TEST_PRODUCT_ID=""
TEST_APPLICATION_ID=""
LAST_CREATED_RESOURCE_ID=""

# Utility functions
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

test_start() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "${BLUE}[TEST $TOTAL_TESTS] $1${NC}"
}

test_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    log "${GREEN}✅ PASS: $1${NC}"
}

test_fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    log "${RED}❌ FAIL: $1${NC}"
}

test_info() {
    log "${CYAN}ℹ️  INFO: $1${NC}"
}

test_warning() {
    log "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Make API request with proper error handling and cleaner output
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"
    local content_type="${5:-application/json}"
    
    # Build curl command
    local curl_cmd="curl -s -w 'HTTP_STATUS:%{http_code}' -X $method '$API_BASE$endpoint'"
    
    if [[ -n "$data" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: $content_type' -d '$data'"
    fi
    
    if [[ -n "$token" ]]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $token'"
    fi
    
    # Execute the request and capture the full response
    local full_response=$(eval "$curl_cmd")
    
    # Extract status code (last part after HTTP_STATUS:)
    local status_code=$(echo "$full_response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d':' -f2)
    
    # Extract body (everything before HTTP_STATUS:)
    local body=$(echo "$full_response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    # Return values for processing
    echo "$status_code|$body"
}

# Extract email and password from user credential string
get_user_email() {
    echo "${TEST_USERS[$1]}" | cut -d':' -f1
}

get_user_password() {
    echo "${TEST_USERS[$1]}" | cut -d':' -f2
}

get_username_from_email() {
    echo "$1" | cut -d'@' -f1
}

# Authentication functions
login_user() {
    local user_key="$1"
    local email=$(get_user_email "$user_key")
    local password=$(get_user_password "$user_key")
    
    test_start "Login user: $user_key ($email)"
    
    local login_data="{
        \"email\": \"$email\",
        \"password\": \"$password\"
    }"
    
    local result=$(make_request "POST" "/auth/login" "$login_data")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: POST /auth/login -> Status: $status_code"
    
    if [[ "$status_code" == "200" ]]; then
        # Extract token using jq if available, otherwise use grep/sed
        local token=""
        if command -v jq &> /dev/null; then
            token=$(echo "$body" | jq -r '.access_token' 2>/dev/null)
        else
            token=$(echo "$body" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        fi
        
        if [[ "$token" != "null" && -n "$token" ]]; then
            USER_TOKENS["$user_key"]="$token"
            test_pass "Login successful for $user_key"
            return 0
        else
            test_fail "Login response missing token for $user_key"
            test_info "Response body: $body"
            return 1
        fi
    else
        test_fail "Login failed for $user_key: HTTP $status_code"
        test_info "Response: $body"
        return 1
    fi
}

register_user() {
    local user_key="$1"
    local email=$(get_user_email "$user_key")
    local password=$(get_user_password "$user_key")
    local username=$(get_username_from_email "$email")
    local role="${2:-user}"
    
    test_start "Register user: $user_key ($email) with role: $role"
    
    local register_data="{
        \"email\": \"$email\",
        \"username\": \"$username\",
        \"full_name\": \"Test User $user_key\",
        \"password\": \"$password\",
        \"confirm_password\": \"$password\",
        \"role\": \"$role\"
    }"
    
    local result=$(make_request "POST" "/auth/register" "$register_data")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: POST /auth/register -> Status: $status_code"
    
    if [[ "$status_code" == "200" || "$status_code" == "201" ]]; then
        test_pass "Registration successful for $user_key"
        return 0
    elif [[ "$status_code" == "400" && "$body" == *"already"* ]]; then
        test_info "User $user_key already exists (expected for seed users)"
        return 0
    else
        test_fail "Registration failed for $user_key: HTTP $status_code"
        test_info "Response: $body"
        return 1
    fi
}

# Test a protected endpoint access
test_protected_access() {
    local user_key="$1"
    local endpoint="$2"
    local expected_status="$3"
    local description="$4"
    
    test_start "$description"
    
    local token="${USER_TOKENS[$user_key]}"
    local result=$(make_request "GET" "$endpoint" "" "$token")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: GET $endpoint -> Status: $status_code"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        test_pass "$description succeeded (HTTP $status_code)"
        return 0
    else
        test_fail "$description failed: expected $expected_status, got $status_code"
        test_info "Response: $body"
        return 1
    fi
}

# Test creating a resource
test_create_resource() {
    local user_key="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local description="$5"
    local resource_id_field="${6:-id}"
    
    test_start "$description"
    
    local token="${USER_TOKENS[$user_key]}"
    local result=$(make_request "POST" "$endpoint" "$data" "$token")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: POST $endpoint -> Status: $status_code"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        test_pass "$description succeeded (HTTP $status_code)"
        
        # Extract resource ID if this was a successful creation
        if [[ ("$status_code" == "200" || "$status_code" == "201") && -n "$resource_id_field" ]]; then
            local resource_id=""
            if command -v jq &> /dev/null; then
                resource_id=$(echo "$body" | jq -r ".$resource_id_field" 2>/dev/null)
            else
                resource_id=$(echo "$body" | grep -o "\"$resource_id_field\":[0-9]*" | cut -d':' -f2)
            fi
            
            if [[ "$resource_id" != "null" && -n "$resource_id" ]]; then
                test_info "Created resource ID: $resource_id"
                # Store the resource ID in a global variable instead of echoing
                LAST_CREATED_RESOURCE_ID="$resource_id"
                return 0
            fi
        fi
        return 0
    else
        test_fail "$description failed: expected $expected_status, got $status_code"
        test_info "Response: $body"
        return 1
    fi
}

# Test updating a resource with PUT/PATCH
test_update_resource() {
    local user_key="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local description="$5"
    local method="${6:-PUT}"
    
    test_start "$description"
    
    local token="${USER_TOKENS[$user_key]}"
    local result=$(make_request "$method" "$endpoint" "$data" "$token")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: $method $endpoint -> Status: $status_code"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        test_pass "$description succeeded (HTTP $status_code)"
        return 0
    else
        test_fail "$description failed: expected $expected_status, got $status_code"
        test_info "Response: $body"
        return 1
    fi
}

# Main test execution
main() {
    log "${PURPLE}🚀 KFATS COMPREHENSIVE AUTHENTICATION TEST SUITE - IMPROVED${NC}"
    log "${PURPLE}=============================================================${NC}"
    log "Started at: $(date)"
    log "Test timestamp: $TEST_TIMESTAMP"
    log "Log file: $LOG_FILE"
    log ""
    
    # ==========================================
    # PHASE 1: SERVER HEALTH CHECK
    # ==========================================
    log "${CYAN}🏥 PHASE 1: SERVER HEALTH CHECK${NC}"
    test_start "Server health check"
    
    health_response=$(curl -s "$HEALTH_ENDPOINT")
    if [[ $? -eq 0 && "$health_response" == *"healthy"* ]]; then
        test_pass "Server is healthy and responding"
        test_info "Health response: $health_response"
    else
        test_fail "Server health check failed"
        log "❌ Cannot proceed with tests. Exiting."
        exit 1
    fi
    
    # ==========================================
    # PHASE 2: USER REGISTRATION TESTS
    # ==========================================
    log "\n${CYAN}👤 PHASE 2: USER REGISTRATION TESTS${NC}"
    
    # Register new test users (skip existing seed users)
    for user_key in testuser1 testuser2 testuser3 testuser4 testuser5; do
        register_user "$user_key" "user"
    done
    
    # Test registration validation
    test_start "Registration with mismatched passwords"
    local result=$(make_request "POST" "/auth/register" "{
        \"email\": \"mismatch_${TEST_TIMESTAMP}@kfats.edu\",
        \"username\": \"mismatch_${TEST_TIMESTAMP}\",
        \"full_name\": \"Mismatch Test\",
        \"password\": \"TestPass123!\",
        \"confirm_password\": \"DifferentPass123!\",
        \"role\": \"user\"
    }")
    
    local status_code=$(echo "$result" | cut -d'|' -f1)
    test_info "Request: POST /auth/register (password mismatch) -> Status: $status_code"
    
    if [[ "$status_code" == "400" ]]; then
        test_pass "Password mismatch validation works"
    else
        test_fail "Password mismatch validation failed: HTTP $status_code"
    fi
    
    # Test duplicate email registration
    test_start "Registration with duplicate email"
    local result=$(make_request "POST" "/auth/register" "{
        \"email\": \"$(get_user_email 'testuser1')\",
        \"username\": \"duplicate_${TEST_TIMESTAMP}\",
        \"full_name\": \"Duplicate Test\",
        \"password\": \"TestPass123!\",
        \"confirm_password\": \"TestPass123!\",
        \"role\": \"user\"
    }")
    
    local status_code=$(echo "$result" | cut -d'|' -f1)
    test_info "Request: POST /auth/register (duplicate email) -> Status: $status_code"
    
    if [[ "$status_code" == "400" ]]; then
        test_pass "Duplicate email validation works"
    else
        test_fail "Duplicate email validation failed: HTTP $status_code"
    fi
    
    # ==========================================
    # PHASE 3: USER LOGIN TESTS
    # ==========================================
    log "\n${CYAN}🔐 PHASE 3: USER LOGIN TESTS${NC}"
    
    # Login all users (including seed users)
    for user_key in "${!TEST_USERS[@]}"; do
        login_user "$user_key"
    done
    
    # Test invalid credentials
    test_start "Login with invalid password"
    local result=$(make_request "POST" "/auth/login" "{
        \"email\": \"$(get_user_email 'testuser1')\",
        \"password\": \"WrongPassword123!\"
    }")
    
    local status_code=$(echo "$result" | cut -d'|' -f1)
    if [[ "$status_code" == "401" ]]; then
        test_pass "Invalid password rejection works"
    else
        test_fail "Invalid password rejection failed: HTTP $status_code"
    fi
    
    # Test non-existent user
    test_start "Login with non-existent email"
    local result=$(make_request "POST" "/auth/login" "{
        \"email\": \"nonexistent_${TEST_TIMESTAMP}@kfats.edu\",
        \"password\": \"TestPass123!\"
    }")
    
    local status_code=$(echo "$result" | cut -d'|' -f1)
    if [[ "$status_code" == "401" ]]; then
        test_pass "Non-existent user rejection works"
    else
        test_fail "Non-existent user rejection failed: HTTP $status_code"
    fi
    
    # ==========================================
    # PHASE 4: OAUTH2 COMPATIBLE LOGIN TESTS
    # ==========================================
    log "\n${CYAN}🔑 PHASE 4: OAUTH2 LOGIN TESTS${NC}"
    
    test_start "OAuth2 compatible login"
    local oauth_data="username=$(get_user_email 'testuser1')&password=$(get_user_password 'testuser1')"
    local result=$(make_request "POST" "/auth/login/oauth" "$oauth_data" "" "application/x-www-form-urlencoded")
    
    local status_code=$(echo "$result" | cut -d'|' -f1)
    local body=$(echo "$result" | cut -d'|' -f2-)
    
    test_info "Request: POST /auth/login/oauth -> Status: $status_code"
    
    if [[ "$status_code" == "200" ]]; then
        # Check for access_token in response
        if [[ "$body" == *"access_token"* ]]; then
            test_pass "OAuth2 login successful"
        else
            test_fail "OAuth2 login response missing access_token"
            test_info "Response: $body"
        fi
    else
        test_fail "OAuth2 login failed: HTTP $status_code"
        test_info "Response: $body"
    fi
    
    # ==========================================
    # PHASE 5: PROTECTED ENDPOINT ACCESS TESTS
    # ==========================================
    log "\n${CYAN}🛡️  PHASE 5: PROTECTED ENDPOINT ACCESS TESTS${NC}"
    
    # Test access without token
    test_start "Access protected endpoint without token"
    local result=$(make_request "GET" "/users/me" "")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    
    test_info "Request: GET /users/me (no token) -> Status: $status_code"
    
    if [[ "$status_code" == "401" || "$status_code" == "403" ]]; then
        test_pass "Unauthorized access properly rejected (HTTP $status_code)"
    else
        test_fail "Unauthorized access not properly rejected: HTTP $status_code"
    fi
    
    # Test access with invalid token
    test_start "Access protected endpoint with invalid token"
    local result=$(make_request "GET" "/users/me" "" "invalid_token_12345")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    
    test_info "Request: GET /users/me (invalid token) -> Status: $status_code"
    
    if [[ "$status_code" == "401" ]]; then
        test_pass "Invalid token properly rejected"
    else
        test_fail "Invalid token not properly rejected: HTTP $status_code"
    fi
    
    # Test valid token access for each user
    for user_key in "${!USER_TOKENS[@]}"; do
        local token="${USER_TOKENS[$user_key]}"
        if [[ -n "$token" ]]; then
            test_protected_access "$user_key" "/users/me" "200" "Profile access for $user_key"
        fi
    done
    
    # ==========================================
    # PHASE 6: ROLE-BASED ACCESS CONTROL TESTS
    # ==========================================
    log "\n${CYAN}👑 PHASE 6: ROLE-BASED ACCESS CONTROL TESTS${NC}"
    
    # Test admin-only endpoints
    if [[ -n "${USER_TOKENS['admin']}" ]]; then
        test_protected_access "admin" "/users/" "200" "Admin access to user list"
    fi
    
    # Test non-admin access to admin endpoints
    if [[ -n "${USER_TOKENS['testuser1']}" ]]; then
        test_protected_access "testuser1" "/users/" "403" "Non-admin denied access to user list"
    fi
    
    # ==========================================
    # PHASE 7: COURSE MANAGEMENT TESTS
    # ==========================================
    log "\n${CYAN}📚 PHASE 7: COURSE MANAGEMENT TESTS${NC}"
    
    # Test mentor course creation
    if [[ -n "${USER_TOKENS['mentor']}" ]]; then
        local course_data="{
            \"title\": \"Test Course ${TEST_TIMESTAMP}\",
            \"description\": \"A comprehensive test course\",
            \"level\": \"beginner\",
            \"price\": 99.99,
            \"status\": \"published\"
        }"
        
        test_create_resource "mentor" "/courses/" "$course_data" "200" "Mentor creating course"
        TEST_COURSE_ID="$LAST_CREATED_RESOURCE_ID"
        test_info "Created course with ID: ${TEST_COURSE_ID:-NO_ID_EXTRACTED}"
    fi
    
    # Test non-mentor course creation
    if [[ -n "${USER_TOKENS['testuser1']}" ]]; then
        local course_data="{
            \"title\": \"Unauthorized Course ${TEST_TIMESTAMP}\",
            \"description\": \"This should fail\",
            \"level\": \"beginner\",
            \"price\": 99.99
        }"
        
        test_create_resource "testuser1" "/courses/" "$course_data" "403" "Regular user denied course creation"
    fi
    
    # Test course enrollment
    if [[ -n "${USER_TOKENS['testuser1']}" && -n "$TEST_COURSE_ID" ]]; then
        test_info "Attempting to enroll in course ID: $TEST_COURSE_ID"
        test_create_resource "testuser1" "/courses/$TEST_COURSE_ID/enroll" "{}" "200" "Student enrolling in course"
    else
        test_warning "Skipping course enrollment test - testuser1 token: ${USER_TOKENS['testuser1']:+PRESENT}, course ID: ${TEST_COURSE_ID:-MISSING}"
    fi
    
    # ==========================================
    # PHASE 8: ARTICLE MANAGEMENT TESTS
    # ==========================================
    log "\n${CYAN}📝 PHASE 8: ARTICLE MANAGEMENT TESTS${NC}"
    
    # Test writer article creation
    if [[ -n "${USER_TOKENS['writer']}" ]]; then
        local article_data="{
            \"title\": \"Test Article ${TEST_TIMESTAMP}\",
            \"content\": \"This is a comprehensive test article content.\",
            \"excerpt\": \"Test article excerpt\",
            \"tags\": [\"test\", \"auth\", \"kfats\"]
        }"
        
        test_create_resource "writer" "/articles/" "$article_data" "200" "Writer creating article"
        TEST_ARTICLE_ID="$LAST_CREATED_RESOURCE_ID"
    fi
    
    # Test non-writer article creation
    if [[ -n "${USER_TOKENS['testuser1']}" ]]; then
        local article_data="{
            \"title\": \"Unauthorized Article ${TEST_TIMESTAMP}\",
            \"content\": \"This should fail\"
        }"
        
        test_create_resource "testuser1" "/articles/" "$article_data" "403" "Regular user denied article creation"
    fi
    
    # ==========================================
    # PHASE 9: PRODUCT MANAGEMENT TESTS
    # ==========================================
    log "\n${CYAN}🛍️  PHASE 9: PRODUCT MANAGEMENT TESTS${NC}"
    
    # Test seller product creation
    if [[ -n "${USER_TOKENS['seller']}" ]]; then
        local product_data="{
            \"name\": \"Test Product ${TEST_TIMESTAMP}\",
            \"description\": \"A test product for authentication testing\",
            \"price\": 49.99,
            \"category\": \"crafts\",
            \"stock_quantity\": 10
        }"
        
        test_create_resource "seller" "/products/" "$product_data" "200" "Seller creating product"
        TEST_PRODUCT_ID="$LAST_CREATED_RESOURCE_ID"
    fi
    
    # Test non-seller product creation
    if [[ -n "${USER_TOKENS['testuser1']}" ]]; then
        local product_data="{
            \"name\": \"Unauthorized Product ${TEST_TIMESTAMP}\",
            \"description\": \"This should fail\",
            \"price\": 99.99,
            \"category\": \"other\"
        }"
        
        test_create_resource "testuser1" "/products/" "$product_data" "403" "Regular user denied product creation"
    fi
    
    # ==========================================
    # PHASE 10: ROLE APPLICATION TESTS
    # ==========================================
    log "\n${CYAN}🎭 PHASE 10: ROLE APPLICATION TESTS${NC}"
    
    # Test role application submission
    if [[ -n "${USER_TOKENS['testuser2']}" ]]; then
        local application_data="{
            \"requested_role\": \"mentor\",
            \"reason\": \"I have extensive teaching experience and want to create courses.\",
            \"application_data\": {\"years_experience\": 5, \"subjects\": [\"art\", \"technology\"]}
        }"
        
        test_create_resource "testuser2" "/role-applications/apply" "$application_data" "200" "User applying for mentor role" "application_id"
        if [[ -n "$LAST_CREATED_RESOURCE_ID" ]]; then
            TEST_APPLICATION_ID="$LAST_CREATED_RESOURCE_ID"
            test_info "Created role application with ID: $TEST_APPLICATION_ID"
        else
            test_warning "No application ID extracted from response"
        fi
    fi
    
    # Test admin reviewing application
    if [[ -n "${USER_TOKENS['admin']}" && -n "$TEST_APPLICATION_ID" ]]; then
        test_info "Attempting to review application ID: $TEST_APPLICATION_ID"
        local review_data="{
            \"status\": \"approved\",
            \"admin_notes\": \"Application approved for testing purposes.\"
        }"
        
        test_update_resource "admin" "/role-applications/$TEST_APPLICATION_ID/review" "$review_data" "200" "Admin reviewing role application"
    else
        test_warning "Skipping application review test - admin token: ${USER_TOKENS['admin']:+PRESENT}, application ID: ${TEST_APPLICATION_ID:-MISSING}"
    fi
    
    # ==========================================
    # PHASE 11: TOKEN SECURITY TESTS
    # ==========================================
    log "\n${CYAN}⏰ PHASE 11: TOKEN SECURITY TESTS${NC}"
    
    # Test with malformed token
    test_start "Access with malformed token"
    local result=$(make_request "GET" "/users/me" "" "malformed.token.here")
    local status_code=$(echo "$result" | cut -d'|' -f1)
    
    if [[ "$status_code" == "401" ]]; then
        test_pass "Malformed token properly rejected"
    else
        test_fail "Malformed token security failed: HTTP $status_code"
    fi
    
    # ==========================================
    # PHASE 12: PUBLIC ENDPOINT TESTS
    # ==========================================
    log "\n${CYAN}🌐 PHASE 12: PUBLIC ENDPOINT TESTS${NC}"
    
    # Test public endpoints
    for endpoint in "/courses/" "/articles/" "/products/"; do
        test_start "Public access to $endpoint"
        local result=$(make_request "GET" "$endpoint")
        local status_code=$(echo "$result" | cut -d'|' -f1)
        
        test_info "Request: GET $endpoint (public) -> Status: $status_code"
        
        if [[ "$status_code" == "200" ]]; then
            test_pass "Public access to $endpoint works"
        else
            test_fail "Public access to $endpoint failed: HTTP $status_code"
        fi
    done
    
    # ==========================================
    # PHASE 13: CROSS-ROLE PERMISSION TESTS
    # ==========================================
    log "\n${CYAN}🔀 PHASE 13: CROSS-ROLE PERMISSION TESTS${NC}"
    
    # Test seller accessing mentor endpoints
    if [[ -n "${USER_TOKENS['seller']}" ]]; then
        local course_data="{
            \"title\": \"Unauthorized Course\",
            \"description\": \"This should fail\",
            \"level\": \"beginner\",
            \"price\": 99.99
        }"
        
        test_create_resource "seller" "/courses/" "$course_data" "403" "Seller denied mentor permissions"
    fi
    
    # Test writer accessing seller endpoints
    if [[ -n "${USER_TOKENS['writer']}" ]]; then
        local product_data="{
            \"name\": \"Unauthorized Product\",
            \"description\": \"This should fail\",
            \"price\": 99.99,
            \"category\": \"other\"
        }"
        
        test_create_resource "writer" "/products/" "$product_data" "403" "Writer denied seller permissions"
    fi
    
    # ==========================================
    # PHASE 14: DATA OWNERSHIP TESTS
    # ==========================================
    log "\n${CYAN}🏠 PHASE 14: DATA OWNERSHIP TESTS${NC}"
    
    # Test users accessing their own data
    for role_endpoint in "mentor:/courses/my-courses" "writer:/articles/my-articles" "seller:/products/my-products"; do
        local role=$(echo "$role_endpoint" | cut -d':' -f1)
        local endpoint=$(echo "$role_endpoint" | cut -d':' -f2)
        
        if [[ -n "${USER_TOKENS[$role]}" ]]; then
            test_protected_access "$role" "$endpoint" "200" "$role accessing own data ($endpoint)"
        fi
    done
    
    # ==========================================
    # PHASE 15: ADMIN PRIVILEGE TESTS
    # ==========================================
    log "\n${CYAN}👨‍💼 PHASE 15: ADMIN PRIVILEGE TESTS${NC}"
    
    if [[ -n "${USER_TOKENS['admin']}" ]]; then
        # Test admin can access all applications
        test_protected_access "admin" "/role-applications/" "200" "Admin accessing all role applications"
        
        # Test admin can access application stats
        test_protected_access "admin" "/role-applications/stats" "200" "Admin accessing application statistics"
    fi
    
    # ==========================================
    # FINAL RESULTS
    # ==========================================
    log "\n${PURPLE}📊 TEST RESULTS SUMMARY${NC}"
    log "${PURPLE}========================${NC}"
    log "Total Tests Run: $TOTAL_TESTS"
    log "${GREEN}Passed: $PASSED_TESTS${NC}"
    log "${RED}Failed: $FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    log "Success Rate: ${success_rate}%"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        log "${GREEN}🎉 ALL TESTS PASSED! Authentication system is working perfectly.${NC}"
        exit_code=0
    elif [[ $success_rate -ge 80 ]]; then
        log "${YELLOW}⚠️  Most tests passed ($success_rate%). Review failures above.${NC}"
        exit_code=0
    else
        log "${RED}❌ Many tests failed ($success_rate% success). Please review the failures above.${NC}"
        exit_code=1
    fi
    
    log "\nTest completed at: $(date)"
    log "Log file saved: $LOG_FILE"
    
    # Show token information for debugging
    log "\n${CYAN}🔑 AUTHENTICATION TOKENS (for debugging):${NC}"
    for user_key in "${!USER_TOKENS[@]}"; do
        local token="${USER_TOKENS[$user_key]}"
        if [[ -n "$token" ]]; then
            log "$user_key: ${token:0:50}..."
        else
            log "$user_key: No token obtained"
        fi
    done
    
    # Show created resources
    log "\n${CYAN}🗂️  CREATED TEST RESOURCES:${NC}"
    [[ -n "$TEST_COURSE_ID" ]] && log "Course ID: $TEST_COURSE_ID"
    [[ -n "$TEST_ARTICLE_ID" ]] && log "Article ID: $TEST_ARTICLE_ID"
    [[ -n "$TEST_PRODUCT_ID" ]] && log "Product ID: $TEST_PRODUCT_ID"
    [[ -n "$TEST_APPLICATION_ID" ]] && log "Application ID: $TEST_APPLICATION_ID"
    
    log "\n${PURPLE}🔗 Useful URLs:${NC}"
    log "API Documentation: http://127.0.0.1:8000/docs"
    log "API Base URL: $API_BASE"
    log "Health Check: $HEALTH_ENDPOINT"
    
    exit $exit_code
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    log "${RED}❌ Error: curl is required but not installed.${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    log "${YELLOW}⚠️  Warning: jq not found. JSON parsing will be limited.${NC}"
    log "Install jq for better JSON handling: sudo apt install jq"
fi

# Run the main test suite
main "$@"
