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
        console.log('📅 Calendar Webhook:', JSON.stringify(body, null, 2));

        // Parse from ElevenLabs format (might be nested in arguments or tool name object)
        const params = body.book_appointment || body.check_calendar || body.arguments || body;

        let action = params.action;
        let date = params.date;
        let startTime = params.start_time || params.startTime;
        let endTime = params.end_time || params.endTime;
        let chatGuid = params.chat_guid || params.chatGuid;

        // Determine command type
        let commandType: string;
        if (action === 'book' || startTime) {
            commandType = 'book_appointment';
        } else {
            commandType = 'check_calendar';
        }

        const queue = getQueue();
        queue.push({
            type: commandType,
            chat_guid: chatGuid,
            date: date || new Date().toISOString().split('T')[0], // Default to today
            start_time: startTime,
            end_time: endTime
        });
        saveQueue(queue);

        console.log(`✅ Queued ${commandType} command`);
        return NextResponse.json({
            status: 'Command queued',
            message: commandType === 'check_calendar'
                ? 'Checking calendar availability...'
                : 'Booking appointment...'
        });
    } catch (e: any) {
        console.error("❌ Calendar Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
