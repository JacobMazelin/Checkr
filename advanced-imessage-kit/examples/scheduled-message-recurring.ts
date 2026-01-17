import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const tomorrow9am = new Date();
            tomorrow9am.setDate(tomorrow9am.getDate() + 1);
            tomorrow9am.setHours(9, 0, 0, 0);

            const daily = await sdk.scheduledMessages.createScheduledMessage({
                type: "send-message",
                payload: {
                    chatGuid: CHAT_GUID,
                    message: "Good morning!",
                    method: "apple-script",
                },
                scheduledFor: tomorrow9am.getTime(),
                schedule: {
                    type: "recurring",
                    intervalType: "daily", // hourly, daily, weekly, monthly, yearly
                    interval: 1,
                },
            });

            console.log(`scheduled: ${daily.id}`);
            console.log(`first: ${tomorrow9am.toLocaleString()}`);
            console.log(`repeats: every day`);
        } catch (error) {
            handleError(error, "Failed to schedule recurring message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
