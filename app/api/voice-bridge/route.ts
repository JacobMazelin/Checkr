
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use a local file for the queue since we removed Vercel KV
// This works perfectly locally.
// On Vercel, this file is ephemeral (will be wiped on deployment/restart),
// but might work for short-term message passing if instances align.
const DB_FILE = path.join(process.cwd(), 'voice_queue.json');

// Helper to get queue safely
function getQueue(): any[] {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading queue:", e);
        return [];
    }
}

// Helper to save queue
function saveQueue(queue: any[]) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(queue, null, 2));
    } catch (e) {
        console.error("Error saving queue:", e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('🎤 Received Voice Webhook:', JSON.stringify(body, null, 2));

        // Schema Detection
        let query = body.search_query || body.query;
        let chatGuid = body.chat_guid;

        if (!query && body.arguments) {
            query = body.arguments.search_query || body.arguments.query;
            chatGuid = body.arguments.chat_guid;
        }

        if (!query) {
            console.error("❌ Missing 'query' in payload.");
            return NextResponse.json({ status: 'Ignored (No Query)' });
        }

        console.log(`✅ Queueing Search (Local File): "${query}"`);

        // Add to local file queue
        const queue = getQueue();
        queue.push({ query, chat_guid: chatGuid }); // Add to end
        saveQueue(queue);

        return NextResponse.json({ status: 'Command queued' });
    } catch (e: any) {
        console.error("❌ Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Poll for commands
        const queue = getQueue();

        if (queue.length === 0) {
            return NextResponse.json({ command: null });
        }

        // Pop the first item (FIFO)
        const command = queue.shift();
        saveQueue(queue);

        return NextResponse.json({ command });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
