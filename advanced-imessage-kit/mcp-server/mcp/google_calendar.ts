import { Tool, SchemaConstraint } from "@leanmcp/core";
import axios from "axios";

class FindFreeTimesInput {
    @SchemaConstraint({ description: "The date to check for free times, in ISO 8601 format (e.g. 2026-01-17)" })
    date!: string;
}

class CreateMeetingInput {
    @SchemaConstraint({ description: "Event start time in RFC3339 format (e.g. 2026-01-17T14:00:00-05:00)" })
    start_time!: string;
    @SchemaConstraint({ description: "Event end time in RFC3339 format" })
    end_time!: string;
}

export class GoogleCalendarTools {
    private getAuthToken(): string {
        // TODO: In a real production environment, this should retrieve the user's OAuth2 token
        // from a secure session or database. For now, we assume it's in env.
        const token = process.env.GOOGLE_ACCESS_TOKEN;
        if (!token) {
            throw new Error("GOOGLE_ACCESS_TOKEN is not set in environment variables.");
        }
        return token;
    }

    @Tool({
        description: "Find available time slots in the user's primary calendar for a given day",
        inputClass: FindFreeTimesInput
    })
    async find_free_times(input: FindFreeTimesInput) {
        try {
            const token = this.getAuthToken();
            const date = new Date(input.date);
            const timeMin = new Date(date);
            timeMin.setHours(0, 0, 0, 0);
            const timeMax = new Date(date);
            timeMax.setHours(23, 59, 59, 999);

            const response = await axios.post(
                "https://www.googleapis.com/calendar/v3/freebusy",
                {
                    timeMin: timeMin.toISOString(),
                    timeMax: timeMax.toISOString(),
                    items: [{ id: "primary" }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const busy = response.data.calendars.primary.busy;
            return {
                content: [{
                    type: "text",
                    text: `Free/Busy information retrieved. Busy slots: ${JSON.stringify(busy)}`
                }]
            };
        } catch (error: any) {
            console.error("Google Calendar API error:", error.response?.data || error.message);
            return {
                content: [{ type: "text", text: `Failed to check calendar: ${error.message}` }]
            };
        }
    }

    @Tool({
        description: "Create a new event named 'Therapist meeting' in an app-created Google Calendar",
        inputClass: CreateMeetingInput
    })
    async create_therapist_meeting(input: CreateMeetingInput) {
        try {
            const token = this.getAuthToken();

            const response = await axios.post(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                {
                    summary: "Therapist meeting",
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

            return {
                content: [{
                    type: "text",
                    text: `Meeting scheduled! Link: ${response.data.htmlLink}`
                }]
            };
        } catch (error: any) {
            console.error("Google Calendar API error:", error.response?.data || error.message);
            return {
                content: [{ type: "text", text: `Failed to create meeting: ${error.message}` }]
            };
        }
    }
}
