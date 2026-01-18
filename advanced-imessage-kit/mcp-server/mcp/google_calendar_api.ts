import { Tool, SchemaConstraint } from "@leanmcp/core";
import axios from "axios";

// Base URL for the calendar API
const API_BASE_URL = process.env.CALENDAR_API_URL || "http://localhost:3000/api/calendar";

class FindFreeTimesWeekInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits, e.g. 1234567890)" })
    phone_number!: string;
}

class CreateMeetingInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits)" })
    phone_number!: string;
    @SchemaConstraint({ description: "Date in format 'Mon, Jan 19' or 'Jan 19'" })
    date!: string;
    @SchemaConstraint({ description: "Time in format '9:00 AM' or '2:30 PM'" })
    time!: string;
}

class SendTextInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits)" })
    phone_number!: string;
    @SchemaConstraint({ description: "Date in format 'Mon, Jan 19' or 'Jan 19'" })
    date!: string;
    @SchemaConstraint({ description: "Time in format '9:00 AM' or '2:30 PM'" })
    time!: string;
}

export class GoogleCalendarTools {
    @Tool({
        description: "Find free time slots in the user's calendar for the next 7 days (weekdays 9am-5pm only)"
    })
    async find_free_times_week(input: FindFreeTimesWeekInput): Promise<string> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/find-free-times`,
                { phone_number: input.phone_number },
                { timeout: 30000 }
            );

            if (response.data.success) {
                const { freeSlots, count } = response.data;
                return `Found ${count} free time slots this week:\n\n${freeSlots.slice(0, 10).join('\n')}${count > 10 ? `\n\n...and ${count - 10} more slots` : ''}`;
            } else {
                throw new Error(response.data.error || 'Failed to get free times');
            }
        } catch (error: any) {
            console.error("Calendar API error:", error.response?.data || error.message);
            throw new Error(`Failed to check calendar: ${error.response?.data?.error || error.message}`);
        }
    }

    @Tool({
        description: "Create a therapy session meeting at a specific date and time (1-hour duration)"
    })
    async create_therapist_meeting(input: CreateMeetingInput): Promise<string> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/create-event`,
                {
                    phone_number: input.phone_number,
                    date: input.date,
                    time: input.time
                },
                { timeout: 30000 }
            );

            if (response.data.success) {
                const { eventId, htmlLink, start, end } = response.data;
                return `✅ Therapy session scheduled!\n\nDate: ${input.date} at ${input.time}\nEvent ID: ${eventId}\n\nView in calendar: ${htmlLink}`;
            } else {
                throw new Error(response.data.error || 'Failed to create event');
            }
        } catch (error: any) {
            console.error("Calendar API error:", error.response?.data || error.message);
            throw new Error(`Failed to create meeting: ${error.response?.data?.error || error.message}`);
        }
    }

    @Tool({
        description: "Send a confirmation text message for a scheduled therapy session"
    })
    async send_text_confirmation(input: SendTextInput): Promise<string> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/send-confirmation`,
                {
                    phone_number: input.phone_number,
                    date: input.date,
                    time: input.time
                },
                { timeout: 30000 }
            );

            if (response.data.success) {
                return response.data.message;
            } else {
                throw new Error(response.data.error || 'Failed to send confirmation');
            }
        } catch (error: any) {
            console.error("Calendar API error:", error.response?.data || error.message);
            throw new Error(`Failed to send confirmation: ${error.response?.data?.error || error.message}`);
        }
    }
}
