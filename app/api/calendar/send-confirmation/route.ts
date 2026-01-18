import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
    try {
        const { phone_number, message, proxy_url } = await req.json();

        if (!phone_number || !message) {
            return NextResponse.json(
                { error: 'Missing required parameters: phone_number, message' },
                { status: 400 }
            );
        }

        // Proxy resolution order:
        // 1) explicit `proxy_url` in request body (testing)
        // 2) `IMESSAGE_PROXY_URL` environment variable
        // 3) fallback to localhost (dev)
        const proxyUrl = proxy_url || process.env.IMESSAGE_PROXY_URL || 'http://localhost:8080';
        
        try {
            await axios.post(`${proxyUrl}/send-message`, {
                phone_number,
                message
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Message sent successfully',
                phone_number
            });
        } catch (sendError: any) {
            console.error("Failed to send message:", sendError.message);
            return NextResponse.json(
                { error: 'Failed to send message', details: sendError.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Send confirmation error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to send confirmation' },
            { status: 500 }
        );
    }
}
