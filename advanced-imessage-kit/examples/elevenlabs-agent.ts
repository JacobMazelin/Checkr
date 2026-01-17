
import { WebSocket } from "ws";
import { createSDK, handleError, handleExit } from "./utils";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local from project root (two levels up from examples/)
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

// --- Configuration ---
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.AGENT_ID || "agent_5501kf586yshfa199gk07af799av";
const TRIGGER_PREFIX = "/agent";

if (!ELEVENLABS_API_KEY) {
    console.warn("WARNING: ELEVENLABS_API_KEY is not set. The agent might not work if it requires auth.");
}

// Map to store active conversations: chatGuid -> WebSocket
const conversations = new Map<string, WebSocket>();

async function main() {
    // Pass config explicitly to handle key name mismatch (PHOTON_API_KEY vs apiKey)
    const sdk = createSDK({
        serverUrl: process.env.SERVER_URL,
        apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    });

    sdk.on("ready", async () => {
        console.log("ElevenLabs Agent Bridge is READY!");
        console.log(`- Agent ID: ${AGENT_ID}`);
        console.log(`- Trigger: Start messages with "${TRIGGER_PREFIX}"`);
    });

    sdk.on("new-message", async (message) => {
        // 1. Basic filtering: Ignore own messages (fromMe) unless testing? 
        // Usually bots reply to incoming messages.
        const text = message.text?.trim();
        if (!text) return;

        console.log(`Received: "${text}" (isFromMe: ${message.isFromMe}, chat: ${message.chats?.[0]?.guid})`);

        const isTrigger = text.startsWith(TRIGGER_PREFIX);

        // Prevent loops: Only allow own messages if they are explicit commands
        if (message.isFromMe && !isTrigger) {
            console.log("Ignoring non-trigger message from self");
            return;
        }

        // If we are already in a "session", maybe we don't need the prefix every time?
        // For this example, let's require the prefix to start, but then keep the session open?
        // Simpler approach: Require prefix for every message OR assume all messages in that chat go to agent if "active".
        // Let's go with: If message starts with /agent, OR if we have an active WS for this chat (sticky session).
        // But how to stop? Maybe "/bye"?

        let userMessage = text;
        const chatGuid = message.chats?.[0]?.guid;
        if (!chatGuid) return;
        let ws = conversations.get(chatGuid);



        if (!ws && !isTrigger) {
            // No active session and no trigger -> ignore
            return;
        }

        if (isTrigger) {
            userMessage = text.slice(TRIGGER_PREFIX.length).trim();
        }

        // If /bye, close session
        if (userMessage.toLowerCase() === "bye" || userMessage.toLowerCase() === "exit") {
            if (ws) {
                ws.close();
                conversations.delete(chatGuid);
                await sdk.messages.sendMessage({
                    chatGuid,
                    message: "Agent session ended.",
                });
            }
            return;
        }

        // 3. Initialize WS if needed
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log(`Opening new ElevenLabs session for ${chatGuid}...`);
            // Construct URL
            const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;

            ws = new WebSocket(url, {
                headers: ELEVENLABS_API_KEY ? { "xi-api-key": ELEVENLABS_API_KEY } : undefined
            });
            conversations.set(chatGuid, ws);

            ws.on("open", () => {
                console.log(`connected to ElevenLabs for ${chatGuid}`);
                // Only send the user message once connected
                sendToAgent(ws!, userMessage);
            });

            ws.on("message", async (data) => {
                try {
                    const event = JSON.parse(data.toString());

                    // Log event type for debugging
                    // console.log("Received event:", event.type);

                    if (event.type === "agent_response") {
                        // The agent sends text responses
                        const responseText = event.agent_response_event?.agent_response;
                        if (responseText) {
                            console.log(`Agent says: ${responseText}`);
                            await sdk.messages.sendMessage({
                                chatGuid,
                                message: responseText,
                            });
                        }
                    } else if (event.type === "audio") {
                        // Ignore audio chunks for text-mode
                        // optionally we could save them and send as audio message!
                        // But requirement said "elevenlabs voice agents specifically" but context implies sending text.
                        // "I've created an agent... hooked it up to my phone number"
                        // If we want to support VOICE (Audio), we would need to capture the audio chunks, combine them, save to file, and send as attachment.
                        // For now, let's stick to text responses.
                    }

                } catch (err) {
                    console.error("Error parsing WS message:", err);
                }
            });

            ws.on("error", (err) => {
                console.error(`WS Error for ${chatGuid}:`, err);
            });

            ws.on("close", () => {
                console.log(`WS Closed for ${chatGuid}`);
                conversations.delete(chatGuid);
            });
        } else {
            // WS already open, just send
            sendToAgent(ws, userMessage);
        }
    });

    handleExit(sdk);
    await sdk.connect();
}

function sendToAgent(ws: WebSocket, text: string) {
    if (!text) return;

    const payload = {
        text: text,
        // Protocol might require "type": "user_message" or similar, 
        // trying standard JSON payload first based on recent search implies just sending text or event.
        // Let's try likely format:
        type: "user_message", // Explicit type
        user_message_event: {
            user_message: text
        }
        // If this fails, we might need to adjust based on error "invalid_message"
    };

    // Actually, looking at commonly used ElevenLabs WS:
    // It usually expects: 
    // { "text": "...", "try_trigger_generation": true } ? No that's for TTS.

    // Let's try the format found in some docs: 
    // { "user_message": "..." } 
    // OR 
    // { "type": "conversation_initiation_client_data", ... } for init.
    // 
    // I'll try constructing the 'user_message' structure.
    // Based on search result 1: "User Message... `type` field indicating it's a user message and a `text` field".

    ws.send(JSON.stringify({
        type: "user_message",
        user_message_event: {
            user_message: text
        }
    }));
}

main().catch(console.error);
