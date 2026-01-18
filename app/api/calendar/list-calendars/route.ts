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

export async function POST(req: NextRequest) {
    try {
        const { phone_number } = await req.json();

        if (!phone_number) {
            return NextResponse.json(
                { error: 'Missing required parameter: phone_number' },
                { status: 400 }
            );
        }

        const token = await getOAuthToken(phone_number);
        
        console.log(`[List Calendars] Fetching calendars for ${phone_number}`);

        // List all calendars the user has access to
        const response = await axios.get(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`[List Calendars] Found ${response.data.items?.length || 0} calendars`);

        return NextResponse.json({
            success: true,
            calendars: response.data.items?.map((cal: any) => ({
                id: cal.id,
                summary: cal.summary,
                primary: cal.primary || false,
                accessRole: cal.accessRole
            }))
        });

    } catch (error: any) {
        console.error("Calendar list error:", error.response?.data || error.message);
        return NextResponse.json(
            { 
                error: error.response?.data?.error?.message || error.message || 'Failed to list calendars',
                details: error.response?.data 
            },
            { status: 500 }
        );
    }
}
