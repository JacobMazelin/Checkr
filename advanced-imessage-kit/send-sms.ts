import * as dotenv from "dotenv";
import path from "path";
import { SDK } from "./index";

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

// Configuration from environment variables
const config = {
    serverUrl: process.env.SERVER_URL || "http://localhost:1234",
    apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    // Format: +1 for US country code + 10 digit number
    phoneNumber: process.env.TEST_PHONE_NUMBER || "+10000000000",
};

const sdk = SDK({
    serverUrl: config.serverUrl,
    apiKey: config.apiKey,
});

console.log("Connecting...");
await sdk.connect();

await new Promise<void>((resolve) => {
    sdk.on("ready", () => resolve());
});

console.log(`Sending message to ${config.phoneNumber}...`);

try {
    // syntax: method;-;address
    // "any" lets the server pick iMessage or SMS automatically
    const chatGuid = `any;-;${config.phoneNumber}`;

    const message = await sdk.messages.sendMessage({
        chatGuid: chatGuid,
        message: "Hello! This is a test message sent to your phone number.",
    });

    console.log("Message sent!");
    console.log("GUID:", message.guid);
} catch (error) {
    console.error("Failed to send:", error);
}

await sdk.close();
process.exit(0);
