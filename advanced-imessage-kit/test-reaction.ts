import { createSDK } from "./examples/utils";
import { config } from "dotenv";
import path from "path";

// Load env from root
// Note: createSDK might assume envs are loaded or check process.env
config({ path: path.join(__dirname, "../.env.local") });

async function run() {
    console.log("Testing Reactions with createSDK...");

    const sdk = createSDK();

    // 1. Get recent chats
    const chats = await sdk.chats.getChats({ limit: 1 });
    if (!chats || chats.length === 0) {
        console.error("No chats found.");
        return;
    }
    const chat = chats[0];
    console.log(`Chat GUID: ${chat.guid}`);

    // 2. Get recent messages
    const messagesResponse: any = await sdk.messages.getMessages({ chatGuid: chat.guid, limit: 10 });

    let msgs: any[] = [];
    if (Array.isArray(messagesResponse)) {
        msgs = messagesResponse;
    } else if (messagesResponse && Array.isArray(messagesResponse.data)) {
        msgs = messagesResponse.data;
    } else {
        console.error("Unknown messages format:", messagesResponse);
        return;
    }

    // Find last message from OTHER person (isFromMe = false)
    const targetMsg = msgs.find((m: any) => !m.isFromMe);

    if (!targetMsg) {
        console.error("No incoming message found to react to.");
        return;
    }

    console.log(`Reacting to message: "${targetMsg.text}" (GUID: ${targetMsg.guid})`);

    // 3. Try reaction
    try {
        await sdk.messages.sendReaction({
            chatGuid: chat.guid,
            messageGuid: targetMsg.guid,
            reaction: "love"
        });
        console.log("Reaction 'love' sent successfully.");
    } catch (e) {
        console.error("Failed to send reaction:", e);
    }

    process.exit(0);
}

run();
