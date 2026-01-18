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
        
        // Get the current time and 7 days from now
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);

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
        
        // Generate free time slots (9am-5pm on weekdays)
        const freeSlots = calculateFreeSlots(now, weekFromNow, busySlots);
        
        return NextResponse.json({
            success: true,
            freeSlots,
            count: freeSlots.length
        });

    } catch (error: any) {
        console.error("Calendar API error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to check calendar' },
            { status: 500 }
        );
    }
}
