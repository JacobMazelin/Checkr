#!/bin/bash

# Test production deployment
PROD_URL="https://nex-hacks-oath.vercel.app"
API_BASE="${PROD_URL}/api/calendar"
PHONE_NUMBER="16304864819"

echo "🧪 Testing Production Calendar API"
echo "============================================================"
echo "Base URL: $PROD_URL"
echo ""

# Wait for deployment
echo "⏳ Waiting for Vercel deployment to complete..."
sleep 10

# Test health
echo "🏥 Checking if app is deployed..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ App not responding (HTTP $HTTP_CODE)"
    echo "💡 Check Vercel dashboard for deployment status"
    exit 1
fi
echo "✅ App is live!"
echo ""

# Test find-free-times
echo "📅 Test 1: Find Free Times"
echo "------------------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_BASE}/find-free-times" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\": \"${PHONE_NUMBER}\"}")

if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Find Free Times: Working"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
    
    # Extract first slot
    FIRST_SLOT=$(echo "$RESPONSE" | grep -o '"[A-Za-z]*, [A-Za-z]* [0-9]* [0-9]*:[0-9]* [AP]M"' | head -1 | tr -d '"')
    
    if [ -n "$FIRST_SLOT" ]; then
        DATE=$(echo "$FIRST_SLOT" | sed -E 's/^([A-Za-z]{3}, [A-Za-z]{3} [0-9]{1,2}).*/\1/')
        TIME=$(echo "$FIRST_SLOT" | sed -E 's/.*([0-9]{1,2}:[0-9]{2} [AP]M)$/\1/')
        
        echo ""
        echo "📝 Test 2: Create Event"
        echo "------------------------------------------------------------"
        CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/create-event" \
          -H "Content-Type: application/json" \
          -d "{\"phone_number\": \"${PHONE_NUMBER}\", \"date\": \"${DATE}\", \"time\": \"${TIME}\"}")
        
        if echo "$CREATE_RESPONSE" | grep -q "success"; then
            echo "✅ Create Event: Working"
            echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null
        else
            echo "❌ Create Event: Failed"
            echo "$CREATE_RESPONSE"
        fi
        
        echo ""
        echo "📱 Test 3: Send Confirmation"
        echo "------------------------------------------------------------"
        CONFIRM_RESPONSE=$(curl -s -X POST "${API_BASE}/send-confirmation" \
          -H "Content-Type: application/json" \
          -d "{\"phone_number\": \"${PHONE_NUMBER}\", \"date\": \"${DATE}\", \"time\": \"${TIME}\"}")
        
        if echo "$CONFIRM_RESPONSE" | grep -q "success"; then
            echo "✅ Send Confirmation: Working"
            echo "$CONFIRM_RESPONSE" | python3 -m json.tool 2>/dev/null
        else
            echo "❌ Send Confirmation: Failed"
            echo "$CONFIRM_RESPONSE"
        fi
    fi
else
    echo "❌ Find Free Times: Failed"
    echo "$RESPONSE"
fi

echo ""
echo "============================================================"
echo "🎉 Production API is live!"
echo "============================================================"
echo ""
echo "API Endpoints:"
echo "  - ${API_BASE}/find-free-times"
echo "  - ${API_BASE}/create-event"
echo "  - ${API_BASE}/send-confirmation"
echo ""
echo "Integration URLs for voice agent:"
echo "  ${API_BASE}/find-free-times"
echo "  ${API_BASE}/create-event"
echo "  ${API_BASE}/send-confirmation"
