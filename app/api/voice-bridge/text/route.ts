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
        console.error("Error reading queue:", e);
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
        console.log('💬 Text Webhook:', JSON.stringify(body, null, 2));

        // Parse from ElevenLabs format (might be nested in send_text or arguments)
        const params = body.send_text || body.arguments || body;

        let message = params.message;
        let chatGuid = params.chat_guid || params.chatGuid;

        if (!message) {
            console.error("❌ Missing 'message' in payload");
            return NextResponse.json({ status: 'Ignored (No Message)' });
        }

        const queue = getQueue();
        queue.push({
            type: 'send_text',
            chat_guid: chatGuid,
            message: message
        });
        saveQueue(queue);

        console.log(`✅ Queued send_text command: "${message.slice(0, 50)}..."`);
        return NextResponse.json({
            status: 'Command queued',
            message: 'Text message will be sent'
        });
    } catch (e: any) {
        console.error("❌ Text Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
