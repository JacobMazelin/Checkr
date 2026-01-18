import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { phone_number, date, time } = await req.json();

        if (!phone_number || !date || !time) {
            return NextResponse.json(
                { error: 'Missing required parameters: phone_number, date, time' },
                { status: 400 }
            );
        }

        const message = `✅ Your therapy session is confirmed for ${date} at ${time}. We'll send you a reminder 24 hours before your appointment.`;

        return NextResponse.json({
            success: true,
            message,
            phone_number
        });

    } catch (error: any) {
        console.error("Confirmation error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to send confirmation' },
            { status: 500 }
        );
    }
}
