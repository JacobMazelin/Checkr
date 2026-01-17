import { SDK } from "./index";

// Configuration from .env.local
const config = {
    serverUrl: "https://e78yri.imsgd.photon.codes/",
    apiKey: "AFSUsGhPPt72n5txn8e394k7",
    recipient: "2697792057"
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
