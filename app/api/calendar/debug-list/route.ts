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
                { error: 'Missing phone_number parameter' },
                { status: 400 }
            );
        }

        const token = await getOAuthToken(phone_number);
        
        // Try to list calendars
        const response = await axios.get(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return NextResponse.json({
            success: true,
            calendars: response.data.items?.map((cal: any) => ({
                id: cal.id,
                summary: cal.summary,
                primary: cal.primary,
                accessRole: cal.accessRole
            }))
        });

    } catch (error: any) {
        console.error("Calendar API error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data || error.message || 'Failed to list calendars' },
            { status: 500 }
        );
    }
}
