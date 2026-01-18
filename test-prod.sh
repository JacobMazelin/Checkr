#!/bin/bash

DOMAIN="https://nex-hacks-oath.vercel.app"
PHONE="16304864819"

echo "======================================"
echo "Testing Production APIs"
echo "Domain: $DOMAIN"
echo "======================================"
echo ""

echo "1️⃣ Image Search"
curl -s -X POST "$DOMAIN/api/search/image" \
  -H "Content-Type: application/json" \
  -d '{"query":"therapy"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Success: {d.get(\"success\")}, Has Image: {d.get(\"hasImage\")}')"
echo ""
sleep 2

echo "2️⃣ Web Search"
curl -s -X POST "$DOMAIN/api/search/web-image" \
  -H "Content-Type: application/json" \
  -d '{"query":"coffee"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Success: {d.get(\"success\")}, Results: {d.get(\"resultCount\")}')"
echo ""
sleep 2

echo "3️⃣ Calendar Find Free Times"
curl -s -X POST "$DOMAIN/api/calendar/find-free-times" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Success: {d.get(\"success\")}, Slots: {d.get(\"count\")}')"
echo ""
sleep 2

echo "4️⃣ Calendar Create Event"
curl -s -X POST "$DOMAIN/api/calendar/create-event" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\",\"date\":\"Jan 25\",\"time\":\"4:00 PM\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Success: {d.get(\"success\")}') if d.get('success') else print(f'   Error: {d.get(\"error\")}')"
echo ""
sleep 2

echo "5️⃣ Send Confirmation"
curl -s -X POST "$DOMAIN/api/calendar/send-confirmation" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\",\"message\":\"Test from production API\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Success: {d.get(\"success\")}') if d.get('success') else print(f'   Error: {d.get(\"error\")}')"
echo ""

echo "======================================"
echo "✅ All Tests Complete!"
echo "======================================"
