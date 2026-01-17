import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const SCHEDULED_ID = process.env.SCHEDULED_ID;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // List all scheduled messages
            const messages = await sdk.scheduledMessages.getScheduledMessages();
            console.log(`found ${messages.length} scheduled message(s)`);

            for (const msg of messages) {
                console.log(`  [${msg.id}] ${msg.status} - ${msg.payload?.message}`);
            }

            // Update a scheduled message
            if (SCHEDULED_ID) {
                const updated = await sdk.scheduledMessages.updateScheduledMessage(SCHEDULED_ID, {
                    type: "send-message",
                    payload: {
                        chatGuid: CHAT_GUID,
                        message: "Updated message!",
                        method: "apple-script",
                    },
                    scheduledFor: Date.now() + 10 * 60 * 1000,
                    schedule: { type: "once" },
                });
                console.log(`updated: ${updated.id}`);

                // Delete
                // await sdk.scheduledMessages.deleteScheduledMessage(SCHEDULED_ID);
                // console.log(`deleted: ${SCHEDULED_ID}`);
            }
        } catch (error) {
            handleError(error, "Failed to manage scheduled messages");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
