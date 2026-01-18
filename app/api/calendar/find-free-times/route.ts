import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import axios from 'axios'

async function refreshAccessToken(refreshToken: string): Promise<string> {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });
        return response.data.access_token;
    } catch (err: any) {
        console.error('[Token Refresh] Failed:', err.response?.data || err.message);
        throw new Error('Failed to refresh access token');
    }
}

async function getOAuthToken(phoneNumber: string): Promise<string> {
    const phoneInt = parseInt(phoneNumber.replace(/\D/g, ''), 10);
    
    const { data, error } = await supabaseServer
        .from('checkrdata')
        .select('oauthcode, description')
        .eq('phone', phoneInt)
        .single();

    if (error || !data?.oauthcode) {
        throw new Error(`OAuth token not found for phone ${phoneNumber}`);
    }

    // Check if we have a refresh token stored in description field
    // Format: "refreshToken:REFRESH_TOKEN_HERE"
    if (data.description && data.description.startsWith('refreshToken:')) {
        const refreshToken = data.description.replace('refreshToken:', '');
        try {
            // Try to refresh the token
            const newAccessToken = await refreshAccessToken(refreshToken);
            // Update the stored access token
            await supabaseServer
                .from('checkrdata')
                .update({ oauthcode: newAccessToken })
                .eq('phone', phoneInt);
            console.log(`[Token Refresh] Successfully refreshed token for ${phoneNumber}`);
            return newAccessToken;
        } catch (err) {
            console.log(`[Token Refresh] Failed, using existing token`);
        }
    }

    return data.oauthcode;
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

        console.log(`[Find Free Times] Fetching OAuth token for: ${phone_number}`);
        const token = await getOAuthToken(phone_number);
        console.log(`[Find Free Times] Token retrieved: ${token ? 'Yes' : 'No'}, length: ${token?.length}`);
        
        // Get the current time and 7 days from now
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);

        console.log(`[Find Free Times] Calling Google Calendar freeBusy API...`);
        const response = await axios.post(
            "https://www.googleapis.com/calendar/v3/freeBusy",
            {
                timeMin: now.toISOString(),
                timeMax: weekFromNow.toISOString(),
                items: [{ id: "primary" }]
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const busySlots = response.data.calendars.primary.busy || [];
        console.log(`[Find Free Times] Found ${busySlots.length} busy slots`);
        
        // Generate free time slots (9am-5pm on weekdays)
        const freeSlots = calculateFreeSlots(now, weekFromNow, busySlots);
        
        return NextResponse.json({
            success: true,
            freeSlots,
            count: freeSlots.length
        });

    } catch (error: any) {
        console.error("[Find Free Times] Error:", error.response?.data || error.message);
        console.error("[Find Free Times] Status:", error.response?.status);
        return NextResponse.json(
            { error: error.response?.data?.error?.message || error.message || 'Failed to check calendar' },
            { status: error.response?.status || 500 }
        );
    }
}
