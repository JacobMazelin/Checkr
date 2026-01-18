
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Received Voice Command:', body);

        // Expect body: { query: "search terms", chat_guid: "..." }
        if (!body.query) {
            return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        // Push to queue (Left Push)
        await kv.lpush('voice_commands', body);

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
