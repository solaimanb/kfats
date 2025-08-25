#!/usr/bin/env bash
set -euo pipefail
# orders_smoke.sh - simple curl-based smoke test for orders flow
# Usage: ./orders_smoke.sh
BASE="http://127.0.0.1:8000/api/v1"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Base URL: $BASE"

# Helper for json output
jq_safe() { command -v jq >/dev/null 2>&1 && jq -C . || python3 -m json.tool || cat; }

# 1) Ensure seller account exists (register may return 400 if already exists)
SELLER_EMAIL="seller@kfats.edu"
SELLER_PW="seller123"
SELLER_USERNAME="seller1"
SELLER_PAYLOAD=$(cat <<-JSON
{ "email": "$SELLER_EMAIL", "username": "$SELLER_USERNAME", "password": "$SELLER_PW", "confirm_password": "$SELLER_PW", "role": "seller", "full_name": "Alice Seller" }
JSON
)

echo "==> Register seller (idempotent)"
resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d "$SELLER_PAYLOAD" )
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true

# 2) Ensure buyer account exists
BUYER_EMAIL="buyer@kfats.edu"
BUYER_PW="buyer123"
BUYER_USERNAME="buyer1"
BUYER_PAYLOAD=$(cat <<-JSON
{ "email": "$BUYER_EMAIL", "username": "$BUYER_USERNAME", "password": "$BUYER_PW", "confirm_password": "$BUYER_PW", "role": "user", "full_name": "Bob Buyer" }
JSON
)

echo "==> Register buyer (idempotent)"
resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d "$BUYER_PAYLOAD" )
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true

# 3) Login seller and buyer
login() {
  local email=$1; local pw=$2; local out=$3
  resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "{\"email\": \"$email\", \"password\": \"$pw\"}" )
  code=$(echo "$resp" | tail -n1)
  body=$(echo "$resp" | sed '$d')
  echo "HTTP $code"
  echo "$body" | jq_safe || true
  if [ "$code" -ne 200 ]; then
    echo "Login failed for $email" >&2; return 1
  fi
  # write full JSON response and token separately
  echo "$body" > "${out}.json"
  token=$(echo "$body" | (command -v jq >/dev/null 2>&1 && jq -r '.access_token' || python3 -c 'import sys,json;print(json.load(sys.stdin).get("access_token"))'))
  echo "$token" > "$out"
}

SELLER_TOKEN_FILE="$TMPDIR/seller.token"
BUYER_TOKEN_FILE="$TMPDIR/buyer.token"

echo "==> Login seller"
login "$SELLER_EMAIL" "$SELLER_PW" "$SELLER_TOKEN_FILE"

echo "==> Login buyer"
if ! login "$BUYER_EMAIL" "$BUYER_PW" "$BUYER_TOKEN_FILE"; then
  echo "Retrying buyer login after a short wait..."
  sleep 1
  login "$BUYER_EMAIL" "$BUYER_PW" "$BUYER_TOKEN_FILE" || { echo "Buyer login failed after retry"; exit 1; }
fi

SELLER_TOKEN=$(cat "$SELLER_TOKEN_FILE")
BUYER_TOKEN=$(cat "$BUYER_TOKEN_FILE")
BUYER_ID=$(cat "${BUYER_TOKEN_FILE}.json" | (command -v jq >/dev/null 2>&1 && jq -r '.user.id' || python3 -c 'import sys,json;print(json.load(sys.stdin)["user"]["id"])'))

# 4) Create a product as seller
echo "==> Create product as seller"
PRODUCT_PAYLOAD=$(cat <<-JSON
{ "name": "Test Product from smoke", "description": "Auto-created product", "price": 9.99, "category": "other", "stock_quantity": 10 }
JSON
)
resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/products/" -H "Content-Type: application/json" -H "Authorization: Bearer $SELLER_TOKEN" -d "$PRODUCT_PAYLOAD")
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true
if [ "$code" -ne 201 -a "$code" -ne 200 ]; then
  echo "Product creation may have failed; continuing if product already exists."
fi

PRODUCT_ID=$(echo "$body" | (command -v jq >/dev/null 2>&1 && jq -r '.id' || python3 -c 'import sys,json;print(json.load(sys.stdin).get("id"))'))
[ -z "$PRODUCT_ID" -o "$PRODUCT_ID" = "null" ] && PRODUCT_ID=1

echo "Using PRODUCT_ID=$PRODUCT_ID"

# 5) Create an order as buyer for that product
echo "==> Create order as buyer"
ORDER_PAYLOAD=$(cat <<-JSON
{ "buyer_id": $BUYER_ID, "items": [ { "product_id": $PRODUCT_ID, "unit_price": 9.99, "quantity": 1 } ], "shipping_address": "123 Test St" }
JSON
)
resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/orders/" -H "Content-Type: application/json" -H "Authorization: Bearer $BUYER_TOKEN" -d "$ORDER_PAYLOAD")
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true
if [ "$code" -ne 200 -a "$code" -ne 201 ]; then
  echo "Order creation failed" >&2
  exit 1
fi
ORDER_ID=$(echo "$body" | (command -v jq >/dev/null 2>&1 && jq -r '.id' || python3 -c 'import sys,json;print(json.load(sys.stdin).get("id"))'))
if [ -z "$ORDER_ID" -o "$ORDER_ID" = "null" ]; then
  echo "ORDER_ID missing in response, aborting"
  exit 1
fi

# 6) Seller: list orders
echo "==> Seller list orders"
resp=$(curl -s -w "\n%{http_code}" -X GET "$BASE/orders/seller/" -H "Authorization: Bearer $SELLER_TOKEN")
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true

# 7) Seller: update order status to "shipped"
echo "==> Seller update order status"
resp=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/orders/$ORDER_ID/status" -H "Content-Type: application/json" -H "Authorization: Bearer $SELLER_TOKEN" -d '{"status":"shipped"}')
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true

# 8) Buyer: request refund (if allowed) - optional
echo "==> Buyer request refund"
resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE/orders/$ORDER_ID/refund" -H "Content-Type: application/json" -H "Authorization: Bearer $BUYER_TOKEN" -d '{}')
code=$(echo "$resp" | tail -n1)
body=$(echo "$resp" | sed '$d')
echo "HTTP $code"
echo "$body" | jq_safe || true


echo "SMOKE TEST COMPLETE"
exit 0
