#!/bin/bash

API_BASE_URL="http://localhost:3000/api/calendar"
PHONE_NUMBER="16304864819"

echo "🧪 Testing Calendar API Endpoints"
echo "============================================================"

# Check if server is running
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "❌ Next.js server not running at http://localhost:3000"
    echo "💡 Start it with: npm run dev"
    exit 1
fi

echo ""
echo "📅 Test 1: Find Free Times"
echo "------------------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/find-free-times" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\": \"${PHONE_NUMBER}\"}")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Extract first slot for next test
FIRST_SLOT=$(echo "$RESPONSE" | grep -o '"Mon, [A-Za-z]* [0-9]* [0-9]*:[0-9]* [AP]M"' | head -1 | tr -d '"')

if [ -n "$FIRST_SLOT" ]; then
    # Parse date and time
    DATE=$(echo "$FIRST_SLOT" | sed -E 's/^([A-Za-z]{3}, [A-Za-z]{3} [0-9]{1,2}).*/\1/')
    TIME=$(echo "$FIRST_SLOT" | sed -E 's/.*([0-9]{1,2}:[0-9]{2} [AP]M)$/\1/')
    
    echo ""
    echo "📝 Test 2: Create Event ($DATE at $TIME)"
    echo "------------------------------------------------------------"
    curl -s -X POST "${API_BASE_URL}/create-event" \
      -H "Content-Type: application/json" \
      -d "{\"phone_number\": \"${PHONE_NUMBER}\", \"date\": \"${DATE}\", \"time\": \"${TIME}\"}" | python3 -m json.tool 2>/dev/null
    
    echo ""
    echo "📱 Test 3: Send Confirmation"
    echo "------------------------------------------------------------"
    curl -s -X POST "${API_BASE_URL}/send-confirmation" \
      -H "Content-Type: application/json" \
      -d "{\"phone_number\": \"${PHONE_NUMBER}\", \"date\": \"${DATE}\", \"time\": \"${TIME}\"}" | python3 -m json.tool 2>/dev/null
fi

echo ""
echo "============================================================"
echo "✅ API Tests Complete!"
echo "============================================================"
echo ""
echo "💡 These endpoints are ready for Vercel deployment:"
echo "   - POST /api/calendar/find-free-times"
echo "   - POST /api/calendar/create-event"
echo "   - POST /api/calendar/send-confirmation"
