import * as dotenv from "dotenv";
import path from "path";
import { SDK } from "./index";

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

// Configuration from environment variables
const config = {
    serverUrl: process.env.SERVER_URL || "http://localhost:1234",
    apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    recipient: process.env.TEST_RECIPIENT_EMAIL || "test@example.com",
};

const sdk = SDK({
    serverUrl: config.serverUrl,
    apiKey: config.apiKey,
});

console.log("Connecting...");
await sdk.connect();

// Wait for connection
await new Promise<void>((resolve) => {
    sdk.on("ready", () => resolve());
});

console.log(`Sending message to ${config.recipient}...`);

try {
    const message = await sdk.messages.sendMessage({
        chatGuid: `iMessage;-;${config.recipient}`,
        message: "Hello from Photon Advanced iMessage Kit! 🚀",
    });

    console.log("Message sent successfully!");
    console.log("GUID:", message.guid);
} catch (error) {
    console.error("Failed to send message:", error);
}

await sdk.close();
process.exit(0);
