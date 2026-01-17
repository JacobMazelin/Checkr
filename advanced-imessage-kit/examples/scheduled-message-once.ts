import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Schedule message for 3 seconds from now
            const scheduledFor = Date.now() + 3 * 1000;

            const scheduled = await sdk.scheduledMessages.createScheduledMessage({
                type: "send-message",
                payload: {
                    chatGuid: CHAT_GUID,
                    message: "This is a scheduled message!",
                    method: "apple-script",
                },
                scheduledFor,
                schedule: { type: "once" },
            });

            console.log(`scheduled: ${scheduled.id}`);
            console.log(`for: ${new Date(scheduledFor).toLocaleString()}`);
        } catch (error) {
            handleError(error, "Failed to schedule message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
