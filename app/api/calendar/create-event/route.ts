import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import axios from 'axios'

async function getOAuthToken(phoneNumber: string): Promise<string> {
    const phoneInt = parseInt(phoneNumber.replace(/\D/g, ''), 10);
    
    const { data, error } = await supabaseServer
        .from('checkrdata')
        .select('oauthcode')
        .eq('phone', phoneInt)
        .single();

    if (error || !data?.oauthcode) {
        throw new Error(`OAuth token not found for phone ${phoneNumber}`);
    }

    return data.oauthcode;
}

async function getOrCreateTherapyCalendar(token: string, phoneNumber: string): Promise<string> {
    try {
        // Check if we have a stored calendar ID in Supabase
        const phoneInt = parseInt(phoneNumber.replace(/\D/g, ''), 10);
        const { data: existing } = await supabaseServer
            .from('checkrdata')
            .select('description')
            .eq('phone', phoneInt)
            .single();

        // If we have a calendar ID stored in description field, use it
        if (existing?.description && existing.description.startsWith('cal_')) {
            const calendarId = existing.description.substring(4); // Remove 'cal_' prefix
            console.log(`[Calendar] Using stored calendar ID: ${calendarId}`);
            return calendarId;
        }

        // Create new secondary calendar for therapy sessions
        console.log(`[Calendar] Creating new therapy calendar...`);
        const createResponse = await axios.post(
            "https://www.googleapis.com/calendar/v3/calendars",
            {
                summary: "Therapy Sessions",
                description: "Calendar for scheduled therapy appointments",
                timeZone: "America/New_York"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const calendarId = createResponse.data.id;
        console.log(`[Calendar] Created new calendar: ${calendarId}`);

        // Store calendar ID in Supabase (prefix with 'cal_' to distinguish from description text)
        await supabaseServer
            .from('checkrdata')
            .update({ description: `cal_${calendarId}` })
            .eq('phone', phoneInt);

        return calendarId;
    } catch (error: any) {
        console.error("[Calendar] Error getting/creating calendar:", error.response?.data || error.message);
        throw error;
    }
}

function parseDateTime(dateStr: string, timeStr: string): Date {
    // Parse date like "Mon, Jan 19" or "Jan 19"
    const year = new Date().getFullYear();
    const datePart = dateStr.replace(/^[A-Za-z]+,\s*/, ''); // Remove day name if present
    const [month, day] = datePart.split(' ');
    
    // Parse time like "9:00 AM" or "2:30 PM"
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour = hours;
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    // Create date object
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(month);
    
    const result = new Date(year, monthIndex, parseInt(day), hour, minutes || 0);
    
    // If the date is in the past, assume next year
    if (result < new Date()) {
        result.setFullYear(year + 1);
    }
    
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const { phone_number, date, time } = await req.json();

        if (!phone_number || !date || !time) {
            return NextResponse.json(
                { error: 'Missing required parameters: phone_number, date, time' },
                { status: 400 }
            );
        }

        const token = await getOAuthToken(phone_number);
        
        console.log(`[Create Event] Creating event for ${phone_number}`);
        console.log(`[Create Event] Date: ${date}, Time: ${time}`);
        
        // Get or create the therapy calendar
        const calendarId = await getOrCreateTherapyCalendar(token, phone_number);
        
        const startTime = parseDateTime(date, time);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);

        console.log(`[Create Event] Start: ${startTime.toISOString()}`);
        console.log(`[Create Event] End: ${endTime.toISOString()}`);

        const event = {
            summary: "Therapy Session",
            description: "Scheduled therapy session",
            start: {
                dateTime: startTime.toISOString(),
                timeZone: "America/New_York"
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: "America/New_York"
            }
        };

        console.log(`[Create Event] Calling Google Calendar API with calendar ID: ${calendarId}...`);
        const response = await axios.post(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
            event,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`[Create Event] Success! Event ID: ${response.data.id}`);
        
        // Send confirmation via ngrok endpoint
        try {
            const confirmationMessage = `✅ Therapy session scheduled!\n\nDate: ${date}\nTime: ${time}\n\nEvent created successfully.`;
            await axios.post('https://proinvestment-drusilla-fortunately.ngrok-free.dev/api/calendar/send-confirmation', {
                phone_number,
                message: confirmationMessage
            }, {
                timeout: 5000
            });
            console.log('[Create Event] Confirmation sent via iMessage');
        } catch (confirmError: any) {
            console.error('[Create Event] Failed to send confirmation:', confirmError.message);
            // Don't fail the request if confirmation fails
        }
        
        return NextResponse.json({
            success: true,
            eventId: response.data.id,
            htmlLink: response.data.htmlLink,
            summary: response.data.summary,
            start: response.data.start.dateTime,
            end: response.data.end.dateTime
        });

    } catch (error: any) {
        console.error("Calendar API error:", error.response?.data || error.message);
        console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
        console.error("Status code:", error.response?.status);
        
        return NextResponse.json(
            { 
                error: error.response?.data?.error?.message || error.message || 'Failed to create event',
                details: error.response?.data 
            },
            { status: 500 }
        );
    }
}
