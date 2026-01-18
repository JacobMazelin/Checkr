
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('🎤 Received Voice Webhook:', JSON.stringify(body, null, 2));

        // Schema Detection
        // 1. Direct property (ElevenLabs flattened)
        // 2. Nested arguments (Standard Tool Call)
        let query = body.search_query || body.query;
        let chatGuid = body.chat_guid;

        if (!query && body.arguments) {
            query = body.arguments.search_query || body.arguments.query;
            chatGuid = body.arguments.chat_guid;
        }

        if (!query) {
            console.error("❌ Missing 'query' in payload. Body:", body);
            // Return 200 anyway to prevent ElevenLabs retrying endlessly
            return NextResponse.json({ status: 'Ignored (No Query)' });
        }

        console.log(`✅ Queueing Search: "${query}" for Chat: ${chatGuid || 'Default'}`);

        // Push to queue (Left Push)
        await kv.lpush('voice_commands', { query, chat_guid: chatGuid });

        return NextResponse.json({ status: 'Command queued' });
    } catch (e: any) {
        console.error("❌ Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Poll for commands (Right Pop)
        // Check if there are any items
        const command = await kv.rpop('voice_commands');

        if (!command) {
            return NextResponse.json({ command: null });
        }

        return NextResponse.json({ command });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
