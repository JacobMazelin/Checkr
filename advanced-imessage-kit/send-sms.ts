import { SDK } from "./index";

// Configuration
const config = {
    serverUrl: "https://e78yri.imsgd.photon.codes/",
    apiKey: "AFSUsGhPPt72n5txn8e394k7",
    // Format: +1 for US country code + 10 digit number
    phoneNumber: "+12697792057"
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
