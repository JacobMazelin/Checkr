import { Anthropic } from "@anthropic-ai/sdk";
import { createSDK, handleExit } from "./examples/utils";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, ".env.local") });

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are a compassionate, professional, and empathetic therapist. 
Your goal is to provide support, active listening, and therapeutic guidance to the user.
Keep your responses concise and natural, suitable for a text message conversation. 
Avoid being overly clinical; be warm and human-like.
If the user expresses something positive, share in their joy. 
If they express distress, offer validation and support.`;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("AI Therapist Bot started with Claude 🧠");
    });

    sdk.on("new-message", async (message) => {
        // Skip messages from self
        if (message.isFromMe) return;

        console.log(`\nReceived: ${message.text || "(no text)"}`);
        console.log(`From: ${message.handle?.address || "unknown"}`);

        const chat = message.chats?.[0];
        if (!chat) return;

        const userText = message.text || message.attributedBody?.[0]?.string || "";
        if (!userText) return;

        try {
            // Show typing indicator while thinking
            await sdk.chats.startTyping(chat.guid);

            // Get response from Claude
            const completion = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 300,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: "user", content: userText }
                ],
            });

            // Stop typing indicator (optional, usually stops on send)
            await sdk.chats.stopTyping(chat.guid);

            const replyText = completion.content[0].type === 'text'
                ? completion.content[0].text
                : "I'm listening, but I'm having trouble finding the right words right now.";

            // Send reply
            const response = await sdk.messages.sendMessage({
                chatGuid: chat.guid,
                message: replyText,
            });

            console.log(`Replied: ${response.guid}`);
            console.log(`AI Text: ${replyText}`);

        } catch (error: any) {
            console.error("Failed to process/reply:", error);
            await sdk.chats.stopTyping(chat.guid);

            // Optional: Send a fallback message if specific errors occur (like API key missing)
            if (error.status === 401) {
                console.error("Authentication error with Anthropic. Check ANTHROPIC_API_KEY.");
            }
        }
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
