import { SDK } from "./index";

// Configuration from .env.local
const config = {
    serverUrl: "https://e78yri.imsgd.photon.codes/",
    apiKey: "AFSUsGhPPt72n5txn8e394k7",
    recipient: "deep24ai@icloud.com"
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
