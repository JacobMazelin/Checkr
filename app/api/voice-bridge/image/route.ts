import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'voice_queue.json');

function getQueue(): any[] {
    try {
        if (!fs.existsSync(DB_FILE)) return [];
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        if (!data || !data.trim()) return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

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
        console.log('🖼️ Image Webhook:', JSON.stringify(body, null, 2));

        // Parse from ElevenLabs format (might be nested)
        const params = body.web_image_search || body.arguments || body;

        let query = params.search_query || params.query;
        let chatGuid = params.chat_guid || params.chatGuid;

        if (!query) {
            return NextResponse.json({ status: 'Ignored (No Query)' });
        }

        const queue = getQueue();
        queue.push({
            type: 'image_search',
            chat_guid: chatGuid,
            query: query
        });
        saveQueue(queue);

        console.log(`✅ Queued image_search command: "${query}"`);
        return NextResponse.json({ status: 'Command queued' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
