
import { createSDK } from "./examples/utils";
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

async function main() {
    const sdk = createSDK({
        serverUrl: process.env.SERVER_URL,
        apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    });

    sdk.on("ready", async () => {
        console.log("Test Script Ready. Sending therapist search request...");

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
                message: "/therapist find me an anxiety therapist in downtown Pittsburgh",
            });

            console.log("Message sent. Waiting 30s for retry/fallback response...");

            const timeout = setTimeout(() => {
                console.log("Timeout waiting for response.");
                sdk.close();
                process.exit(1);
            }, 30000);

            sdk.on("new-message", (msg) => {
                // Ignore our own request
                if (msg.text?.includes("/therapist find me")) return;

                if (msg.isFromMe && msg.text) {
                    console.log(`Received message: ${msg.text.substring(0, 150)}...`);
                    if (msg.text.includes("Psychology Today") || msg.text.toLowerCase().includes("therapist") || msg.text.includes("http")) {
                        console.log("✅ SUCCESS: Received search result or fallback!");
                        clearTimeout(timeout);
                        sdk.close();
                        process.exit(0);
                    }
                }
            });
        } catch (e) {
            console.error("Error sending test message:", e);
            process.exit(1);
        }
    });

    await sdk.connect();
}

main().catch(console.error);
