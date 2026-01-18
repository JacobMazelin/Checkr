import * as dotenv from "dotenv";
import path from "path";
import { SDK } from "./index";

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

// Configuration from environment variables
const config = {
    serverUrl: process.env.SERVER_URL || "http://localhost:1234",
    apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    recipient: process.env.TEST_RECIPIENT || "0000000000",
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
        chatGuid: `SMS;-;+1${config.recipient}`, // Trying SMS with country code +1 first
        message: "Hello from Photon Advanced iMessage Kit! 🚀",
    });

    console.log("Message sent successfully!");
    console.log("GUID:", message.guid);
} catch (error) {
    console.error("Failed to send message:", error);
    try {
        console.log("Retrying with iMessage...");
        const message = await sdk.messages.sendMessage({
            chatGuid: `iMessage;-;+1${config.recipient}`,
            message: "Hello from Photon Advanced iMessage Kit! 🚀",
        });
        console.log("Message sent successfully!");
        console.log("GUID:", message.guid);
    } catch (retryError) {
        console.error("Failed to send message on retry:", retryError);
    }
}

await sdk.close();
process.exit(0);
