
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Received Voice Command:', body);

        // Expect body: { search_query: "search terms" }
        // User changed schema: "search_query" (string)
        const query = body.search_query || body.query; // Support both just in case

        if (!query) {
            return NextResponse.json({ error: 'Missing search_query' }, { status: 400 });
        }

        // Push to queue (Left Push) - Normalize to internal format
        await kv.lpush('voice_commands', { query, chat_guid: body.chat_guid });

        return NextResponse.json({ status: 'Command queued' });
    } catch (e: any) {
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
