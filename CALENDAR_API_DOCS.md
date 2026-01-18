# Calendar API Documentation

## Overview
The Calendar API provides three endpoints for managing therapy session scheduling via Google Calendar. These endpoints are deployed as part of the Next.js application and can be accessed at `/api/calendar/*`.

## Base URL
- **Development**: `http://localhost:3000/api/calendar`
- **Production**: `https://your-app.vercel.app/api/calendar`

## Authentication
All endpoints require a valid `phone_number` parameter. The phone number must be registered in the Supabase `checkrdata` table with a valid Google OAuth access token.

---

## Endpoints

### 1. Find Free Times
**Endpoint**: `POST /api/calendar/find-free-times`

Retrieves available time slots for the next 7 days (weekdays only, 9 AM - 5 PM).

#### Request Body
```json
{
  "phone_number": "16304864819"
}
```

#### Response
```json
{
  "success": true,
  "freeSlots": [
    "Mon, Jan 19 9:00 AM",
    "Mon, Jan 19 10:00 AM",
    "Mon, Jan 19 11:00 AM",
    ...
  ],
  "count": 38
}
```

#### Example cURL
```bash
curl -X POST https://your-app.vercel.app/api/calendar/find-free-times \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "16304864819"}'
```

---

### 2. Create Event
**Endpoint**: `POST /api/calendar/create-event`

Creates a new therapy session event in the user's Google Calendar.

#### Request Body
```json
{
  "phone_number": "16304864819",
  "date": "Mon, Jan 19",
  "time": "9:00 AM"
}
```

#### Response
```json
{
  "success": true,
  "eventId": "588nnm2o6vbiutvq1ef8kugrrg",
  "htmlLink": "https://www.google.com/calendar/event?eid=...",
  "summary": "Therapy Session",
  "start": "2026-01-19T09:00:00-05:00",
  "end": "2026-01-19T10:00:00-05:00"
}
```

#### Example cURL
```bash
curl -X POST https://your-app.vercel.app/api/calendar/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "16304864819",
    "date": "Mon, Jan 19",
    "time": "9:00 AM"
  }'
```

---

### 3. Send Confirmation
**Endpoint**: `POST /api/calendar/send-confirmation`

Generates a confirmation message for a scheduled therapy session.

#### Request Body
```json
{
  "phone_number": "16304864819",
  "date": "Mon, Jan 19",
  "time": "9:00 AM"
}
```

#### Response
```json
{
  "success": true,
  "message": "✅ Your therapy session is confirmed for Mon, Jan 19 at 9:00 AM. We'll send you a reminder 24 hours before your appointment.",
  "phone_number": "16304864819"
}
```

#### Example cURL
```bash
curl -X POST https://your-app.vercel.app/api/calendar/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "16304864819",
    "date": "Mon, Jan 19",
    "time": "9:00 AM"
  }'
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK**: Request successful
- **400 Bad Request**: Missing required parameters
- **500 Internal Server Error**: Server-side error (OAuth token invalid, API error, etc.)

### Error Response Format
```json
{
  "error": "OAuth token not found for phone 16304864819"
}
```

---

## Workflow Example

### Complete Booking Flow
```bash
# 1. Find available times
SLOTS=$(curl -s -X POST https://your-app.vercel.app/api/calendar/find-free-times \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "16304864819"}')

echo "$SLOTS"

# 2. Create event in first available slot
curl -X POST https://your-app.vercel.app/api/calendar/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "16304864819",
    "date": "Mon, Jan 19",
    "time": "9:00 AM"
  }'

# 3. Send confirmation
curl -X POST https://your-app.vercel.app/api/calendar/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "16304864819",
    "date": "Mon, Jan 19",
    "time": "9:00 AM"
  }'
```

---

## Testing

### Local Testing
```bash
# Start the Next.js development server
npm run dev

# Run the test script
./test-calendar-api.sh
```

### Production Testing
```bash
# Build and start production server
npm run build
npm run start

# Run tests against localhost:3000
./test-calendar-api.sh
```

---

## Deployment to Vercel

### Prerequisites
1. Supabase credentials set in environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. User phone numbers registered with valid Google OAuth tokens

### Deploy
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables
Add these in your Vercel dashboard under Settings → Environment Variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXTAUTH_URL`: Your Vercel deployment URL
- `NEXTAUTH_SECRET`: Your NextAuth secret
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

---

## Technical Details

### OAuth Flow
1. User signs in via `/` (homepage) with phone number
2. OAuth token (ACCESS_TOKEN) saved to Supabase
3. API endpoints retrieve token from Supabase
4. Token used to call Google Calendar API

### Free Time Calculation
- **Days**: Weekdays only (Monday-Friday)
- **Hours**: 9:00 AM - 5:00 PM (8 slots per day)
- **Duration**: 1-hour sessions
- **Logic**: Excludes any time overlapping with existing calendar events

### Time Zone
All times are handled in `America/New_York` timezone.

---

## Integration with Voice Agent

These APIs can be called from ElevenLabs voice agent or any other service:

```javascript
// Example: ElevenLabs webhook handler
async function handleVoiceRequest(phoneNumber, intent) {
  if (intent === 'find_times') {
    const response = await fetch('https://your-app.vercel.app/api/calendar/find-free-times', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phoneNumber })
    });
    return await response.json();
  }
}
```

---

## Support

For issues or questions:
1. Check the test script output for detailed error messages
2. Verify OAuth token is valid in Supabase
3. Check Vercel deployment logs
4. Review Google Calendar API quotas

---

**Last Updated**: January 18, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
