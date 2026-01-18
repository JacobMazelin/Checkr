#!/bin/bash

echo "======================================"
echo "Testing Search API Endpoints"
echo "======================================"
echo ""

BASE_URL="localhost:3000"
PHONE="16304864819"

# Test 1: Image Search
echo "📸 Test 1: Image Search"
echo "Query: therapy office"
curl -s -X POST "$BASE_URL/api/search/image" \
  -H "Content-Type: application/json" \
  -d '{"query":"therapy office"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Success: {data[\"success\"]}\n🔍 Query: {data[\"query\"]}\n🖼️  Has Image: {data[\"hasImage\"]}\n🔗 URL: {data[\"imageUrl\"][:80]}...' if data['hasImage'] else '❌ No image found')"
echo ""
echo "--------------------------------------"
echo ""

# Test 2: Web + Image Search
echo "📚 Test 2: Web Search"
echo "Query: best coffee shops in Ann Arbor"
curl -s -X POST "$BASE_URL/api/search/web-image" \
  -H "Content-Type: application/json" \
  -d '{"query":"best coffee shops in Ann Arbor"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Success: {data[\"success\"]}\n🔍 Query: {data[\"query\"]}\n📄 Results: {data[\"resultCount\"]}') if data.get('success') else print(f'❌ Error: {data.get(\"error\")}')"
echo ""
echo "--------------------------------------"
echo ""
sleep 2

# Test 3: Calendar Find Free Times (for phone number)
echo "📅 Test 3: Find Free Times for $PHONE"
curl -s -X POST "$BASE_URL/api/calendar/find-free-times" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\"}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Success: {data[\"success\"]}\n📊 Free Slots: {data[\"count\"]}\n🕐 First Few Slots: {data[\"freeSlots\"][:3]}') if data.get('success') else print(f'❌ Error: {data.get(\"error\")}')"
echo ""
echo "--------------------------------------"
echo ""
sleep 2

# Test 4: Image search with therapy-related query
echo "🏥 Test 4: Therapy-related Image Search"
echo "Query: mental health counseling"
curl -s -X POST "$BASE_URL/api/search/image" \
  -H "Content-Type: application/json" \
  -d '{"query":"mental health counseling"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Success: {data[\"success\"]}\n🔍 Query: {data[\"query\"]}\n🖼️  Has Image: {data[\"hasImage\"]}') if data.get('success') else print(f'❌ Error: {data.get(\"error\")}')"
echo ""
echo "--------------------------------------"
echo ""
sleep 2

# Test 5: Multiple image searches to test rate limiting
echo "⚡ Test 5: Multiple Searches (testing API consistency)"
for search_term in "therapy room" "counselor office" "meditation space"; do
    echo "  🔍 Searching: $search_term"
    result=$(curl -s -X POST "$BASE_URL/api/search/image" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"$search_term\"}")
    success=$(echo $result | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
    echo "     ✓ Result: $success"
    sleep 1
done
echo ""
echo "--------------------------------------"
echo ""

echo "======================================"
echo "All Tests Complete!"
echo "======================================"
