
import { createSDK, handleExit } from "./examples/utils";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local from project root
const envPath = path.resolve(process.cwd(), ".env.local");
console.log(`Loading .env.local from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.warn("Retrying with relative path...");
    dotenv.config({ path: path.join(__dirname, "../.env.local") });
}

console.log("SERVER_URL:", process.env.SERVER_URL ? "Set" : "Missing");
console.log("API_KEY:", process.env.API_KEY || process.env.PHOTON_API_KEY ? "Set" : "Missing");

// Self-chat GUID or a known chat GUID
// If not provided, it receives messages from real world, but for testing we want to trigger it ourselves?
// Actually if we just send a message to OURSELF matching /therapist, the bot running in the other process should pick it up?
// No, if we run two SDK instances, they both receive the 'new-message' event.
// So if I run this script, it might compete or just co-exist. 
// The user is running therapist-bot.ts.
// I will just send a message.

async function main() {
    const sdk = createSDK({
        serverUrl: process.env.SERVER_URL,
        apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    });

    sdk.on("ready", async () => {
        console.log("Test Script Ready. Sending image request...");

        // Find a valid chat to send to (e.g. self)
        // Or just use the one from env
        // Let's list chats first or just hardcode a self-message if we know our own number
        // We can just send to "self" if we know the handle, or find a recent chat.

        try {
            // Fetch recent chats to find a valid one
            const chats = await sdk.chats.getChats({ limit: 1 });
            if (chats.length === 0) {
                console.error("No chats found to test with.");
                process.exit(1);
            }
            const chatGuid = chats[0]?.guid;
            if (!chatGuid) {
                console.error("Chat found but no GUID?");
                process.exit(1);
            }
            console.log(`Sending test trigger to chat: ${chatGuid}`);

            await sdk.messages.sendMessage({
                chatGuid: chatGuid,
                message: "/therapist send me a picture of a cute puppy",
            });

            console.log("Message sent. Waiting for response...");

            const timeout = setTimeout(() => {
                console.error("Timeout waiting for response.");
                sdk.close();
                process.exit(1);
            }, 30000);

            sdk.on("new-message", (message) => {
                // Ignore our own request
                if (message.text?.includes("/therapist send me")) return;

                console.log("Received message:", message.text);
                if (message.attachments && message.attachments.length > 0) {
                    console.log("✅ SUCCESS: Received attachment!", message.attachments);
                    clearTimeout(timeout);
                    sdk.close();
                    process.exit(0);
                } else if (message.text?.includes("Couldn't preview")) {
                    console.log("⚠️ Received fallback link message.");
                    clearTimeout(timeout);
                    sdk.close();
                    process.exit(0);
                }
            });

        } catch (e) {
            console.error("Error sending test message:", e);
            process.exit(1);
        }
    });

    await sdk.connect();
}

main();
