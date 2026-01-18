import { Tool, SchemaConstraint } from "@leanmcp/core";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

class FindFreeTimesWeekInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits, e.g. 1234567890)" })
    phone_number!: string;
}

class CreateMeetingInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits)" })
    phone_number!: string;
    @SchemaConstraint({ description: "Event start time in RFC3339 format (e.g. 2026-01-17T14:00:00-05:00)" })
    start_time!: string;
    @SchemaConstraint({ description: "Event end time in RFC3339 format" })
    end_time!: string;
}

class SendTextInput {
    @SchemaConstraint({ description: "The user's phone number (just the digits)" })
    phone_number!: string;
    @SchemaConstraint({ description: "The text message to send" })
    message!: string;
}

export class GoogleCalendarTools {
    private async getOAuthToken(phoneNumber: string): Promise<string> {
        try {
            const phoneInt = parseInt(phoneNumber.replace(/\D/g, ''));
            const { data, error } = await supabase
                .from('checkrdata')
                .select('oauthcode')
                .eq('phone', phoneInt)
                .single();

            if (error || !data?.oauthcode) {
                throw new Error(`No OAuth token found for phone: ${phoneNumber}`);
            }

            return data.oauthcode;
        } catch (error: any) {
            throw new Error(`Failed to retrieve OAuth token: ${error.message}`);
        }
    }

    @Tool({
        description: "Find available time slots in the user's primary calendar for the entire upcoming week (7 days from now). Returns a list of free time slots formatted as human-readable strings.",
        inputClass: FindFreeTimesWeekInput
    })
    async find_free_times_week(input: FindFreeTimesWeekInput) {
        try {
            const token = await this.getOAuthToken(input.phone_number);
            
            // Get the current time and 7 days from now
            const now = new Date();
            const weekFromNow = new Date();
            weekFromNow.setDate(now.getDate() + 7);

            const response = await axios.post(
                "https://www.googleapis.com/calendar/v3/freebusy",
                {
                    timeMin: now.toISOString(),
                    timeMax: weekFromNow.toISOString(),
                    items: [{ id: "primary" }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const busySlots = response.data.calendars.primary.busy || [];
            
            // Generate free time slots (9am-5pm on weekdays)
            const freeSlots = this.calculateFreeSlots(now, weekFromNow, busySlots);
            
            return {
                content: [{
                    type: "text",
                    text: `Found ${freeSlots.length} free time slots this week:\n${freeSlots.join('\n')}`
                }]
            };
        } catch (error: any) {
            console.error("Google Calendar API error:", error.response?.data || error.message);
            return {
                content: [{ type: "text", text: `Failed to check calendar: ${error.message}` }]
            };
        }
    }

    private calculateFreeSlots(startDate: Date, endDate: Date, busySlots: any[]): string[] {
        const freeSlots: string[] = [];
        const current = new Date(startDate);
        
        // Round to next hour
        current.setMinutes(0, 0, 0);
        current.setHours(current.getHours() + 1);

        while (current < endDate) {
            // Only check weekdays, 9am-5pm
            const dayOfWeek = current.getDay();
            const hour = current.getHours();
            
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17) {
                const slotEnd = new Date(current);
                slotEnd.setHours(slotEnd.getHours() + 1);
                
                // Check if this slot is free
                const isBusy = busySlots.some((busy: any) => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return (current >= busyStart && current < busyEnd) ||
                           (slotEnd > busyStart && slotEnd <= busyEnd) ||
                           (current <= busyStart && slotEnd >= busyEnd);
                });

                if (!isBusy) {
                    const dayName = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const timeSlot = current.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const endTimeSlot = slotEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    freeSlots.push(`${dayName} ${timeSlot}-${endTimeSlot}`);
                }
            }

            current.setHours(current.getHours() + 1);
        }

        return freeSlots;
    }

    @Tool({
        description: "Create a new event named 'Therapy Session' in the user's primary Google Calendar",
        inputClass: CreateMeetingInput
    })
    async create_therapist_meeting(input: CreateMeetingInput) {
        try {
            const token = await this.getOAuthToken(input.phone_number);

            const response = await axios.post(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                {
                    summary: "Therapy Session",
                    start: { dateTime: input.start_time },
                    end: { dateTime: input.end_time }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const eventTime = new Date(input.start_time).toLocaleString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            return {
                content: [{
                    type: "text",
                    text: `✅ Therapy session scheduled for ${eventTime}! Calendar link: ${response.data.htmlLink}`
                }]
            };
        } catch (error: any) {
            console.error("Google Calendar API error:", error.response?.data || error.message);
            return {
                content: [{ type: "text", text: `Failed to create meeting: ${error.message}` }]
            };
        }
    }

    @Tool({
        description: "Send a text message confirmation to the user via iMessage. Use this after booking a therapy session.",
        inputClass: SendTextInput
    })
    async send_text_confirmation(input: SendTextInput) {
        try {
            // This will be called by the ElevenLabs agent, which needs to send the message
            // back through the iMessage bot. For now, we'll return the formatted message
            // that should be sent.
            return {
                content: [{
                    type: "text",
                    text: `TEXT_CONFIRMATION: Send this message to ${input.phone_number}: "${input.message}"`
                }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Failed to send text: ${error.message}` }]
            };
        }
    }
}
