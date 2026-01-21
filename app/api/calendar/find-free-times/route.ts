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

async function getAllCalendarIds(token: string): Promise<string[]> {
    try {
        console.log("Attempting to fetch calendar list with token...");
        const response = await axios.get(
            "https://www.googleapis.com/calendar/v3/calendarList",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const calendarIds = response.data.items
            .filter((cal: any) => cal.accessRole === 'owner' || cal.accessRole === 'reader' || cal.accessRole === 'writer')
            .map((cal: any) => cal.id);
        
        console.log("✅ Successfully fetched calendars:", calendarIds);
        return calendarIds;
    } catch (error: any) {
        console.error("❌ Failed to get calendars:", error.response?.status, error.response?.data || error.message);
        
        // If 404 or 403, likely missing calendar.calendarlist.readonly scope
        if (error.response?.status === 404 || error.response?.status === 403) {
            console.error("⚠️  Missing calendar.calendarlist.readonly scope. User needs to re-authenticate with new scopes.");
            console.error("Full error response:", JSON.stringify(error.response?.data, null, 2));
        }
        
        console.log("⚠️  Falling back to primary calendar only");
        return ["primary"]; // Fallback to primary
    }
}

function calculateFreeSlots(startDate: Date, endDate: Date, busySlots: any[]): string[] {
    const freeSlots: string[] = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
        // Only check weekdays (1-5)
        if (current.getDay() >= 1 && current.getDay() <= 5) {
            // Check 9am to 5pm (9 slots per day)
            for (let hour = 9; hour < 17; hour++) {
                const slotStart = new Date(current);
                slotStart.setHours(hour, 0, 0, 0);
                
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1, 0, 0, 0);
                
                // Check if this slot overlaps with any busy time
                const isBusy = busySlots.some((busy: any) => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return (slotStart < busyEnd && slotEnd > busyStart);
                });
                
                if (!isBusy) {
                    const dayName = slotStart.toLocaleDateString('en-US', { weekday: 'short' });
                    const monthDay = slotStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const timeStr = slotStart.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                    });
                    
                    freeSlots.push(`${dayName}, ${monthDay} ${timeStr}`);
                }
            }
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return freeSlots;
}

export async function POST(req: NextRequest) {
    try {
        const { phone_number } = await req.json();

        if (!phone_number) {
            return NextResponse.json(
                { error: 'Missing phone_number parameter' },
                { status: 400 }
            );
        }

        const token = await getOAuthToken(phone_number);
        
        // Get all calendar IDs
        const calendarIds = await getAllCalendarIds(token);
        
        // Get the current time and 7 days from now
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);

        // Build items array with all calendars
        const items = calendarIds.map(id => ({ id }));

        const response = await axios.post(
            "https://www.googleapis.com/calendar/v3/freeBusy",
            {
                timeMin: now.toISOString(),
                timeMax: weekFromNow.toISOString(),
                items: items
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Google Calendar FreeBusy Response:", JSON.stringify(response.data, null, 2));
        
        // Aggregate busy slots from all calendars
        const allBusySlots: any[] = [];
        for (const calendarId of calendarIds) {
            const busySlots = response.data.calendars[calendarId]?.busy || [];
            console.log(`Busy slots for ${calendarId}:`, busySlots.length);
            allBusySlots.push(...busySlots);
        }
        
        console.log("Total busy slots from all calendars:", allBusySlots.length, allBusySlots);
        
        // Generate free time slots (9am-5pm on weekdays)
        const freeSlots = calculateFreeSlots(now, weekFromNow, allBusySlots);
        
        // Send confirmation via ngrok endpoint
        try {
            const topSlots = freeSlots.slice(0, 10); // Send first 10 slots
            const confirmationMessage = `📅 Found ${freeSlots.length} free time slots in the next 7 days:\n\n${topSlots.join('\n')}${freeSlots.length > 10 ? '\n\n...and more' : ''}`;
            await axios.post('https://proinvestment-drusilla-fortunately.ngrok-free.dev/api/calendar/send-confirmation', {
                phone_number,
                message: confirmationMessage
            }, {
                timeout: 5000
            });
            console.log('[Find Free Times] Confirmation sent via iMessage');
        } catch (confirmError: any) {
            console.error('[Find Free Times] Failed to send confirmation:', confirmError.message);
            // Don't fail the request if confirmation fails
        }
        
        return NextResponse.json({
            success: true,
            freeSlots,
            count: freeSlots.length,
            calendarsChecked: calendarIds.length
        });

    } catch (error: any) {
        console.error("Calendar API error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to check calendar' },
            { status: 500 }
        );
    }
}
