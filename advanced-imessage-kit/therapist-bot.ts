import { Anthropic } from "@anthropic-ai/sdk";
import { createSDK, handleExit } from "./examples/utils";
import * as dotenv from "dotenv";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import axios from "axios";
import { search, searchImages, SafeSearchType } from "duck-duck-scrape";

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, "../.env.local") });


// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Helper to ensure URL is set for local dev if missing
if (!process.env.LEAN_MCP_URL) {
    process.env.LEAN_MCP_URL = "http://localhost:3001/mcp";
}

// Debug logs
console.log("--- Debug Config ---");
console.log("SERVER_URL:", process.env.SERVER_URL ? "Set" : "Not Set");
console.log("API_KEY:", process.env.API_KEY || process.env.PHOTON_API_KEY ? "Set" : "Not Set");
console.log("CLAUDE_API_KEY:", process.env.CLAUDE_API_KEY ? "Set" : "Not Set");
console.log("BRAVE_API_KEY:", process.env.BRAVE_API_KEY ? "Set" : "Not Set");
console.log("--------------------");

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// Simple In-Memory State for User Profile
interface UserProfile {
    name: string | null;
    work: string | null;
    backgroundInfo: string | null;
}
const userProfile: UserProfile = {
    name: null,
    work: null,
    backgroundInfo: null,
};

// Conversation History per Chat (keyed by chat GUID)
const conversationHistory: Map<string, any[]> = new Map();

// Global Rate Limiter for Brave API (Max 1 req/sec)
let lastRequestTime = 0;
async function rateLimitDelay() {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < 1100) { // Slightly more than 1s to be safe
        const wait = 1100 - timeSinceLast;
        // console.log(`Rate limiting: waiting ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
    }
    lastRequestTime = Date.now();
}

// Reusable Search Functions
async function performImageSearch(query: string): Promise<string> {
    console.log(`Searching for image (Brave): ${query}`);
    await rateLimitDelay();

    try {
        const safeQuery = query.includes("building") || query.includes("exterior")
            ? query
            : `${query} storefront exterior`;

        const braveImageResponse = await axios.get(
            `https://api.search.brave.com/res/v1/images/search`,
            {
                params: {
                    q: safeQuery,
                    count: 1,
                    search_lang: 'en'
                },
                headers: {
                    'Accept': 'application/json',
                    'X-Subscription-Token': process.env.BRAVE_API_KEY
                }
            }
        );

        const results = braveImageResponse.data.results || [];
        if (results.length > 0) {
            const imgUrl = results[0].properties?.url || results[0].thumbnail?.src;
            if (imgUrl) {
                console.log(`Found image: ${imgUrl}`);
                return imgUrl;
            }
        }
        return "No valid image URL found.";
    } catch (e: any) {
        console.error("Brave image search failed:", e.message);
        return `Image search failed: ${e.message}`;
    }
}

async function performWebSearch(query: string): Promise<string> {
    console.log(`Searching web (Brave): ${query}`);
    await rateLimitDelay();

    try {
        const braveResponse = await axios.get(
            `https://api.search.brave.com/res/v1/web/search`,
            {
                params: { q: query },
                headers: {
                    'Accept': 'application/json',
                    'X-Subscription-Token': process.env.BRAVE_API_KEY
                }
            }
        );

        const results = braveResponse.data.web?.results || [];
        if (results.length > 0) {
            return results.slice(0, 3).map((r: any) =>
                `**${r.title}**\n${r.description}\nLink: ${r.url}`
            ).join("\n\n");
        } else {
            return "No results found.";
        }
    } catch (e: any) {
        console.error("Brave search failed:", e.message);
        return `Search failed: ${e.message}`;
    }
}


const SYSTEM_PROMPT = `You are Jack, a Psychology Resident (Therapist in Training).
**CORE PERSONA:**
- You are a Gen Z therapist (24yo). You text casually (lowercase, 'u', 'rn') but your mind is 100% CLINICAL.
- **VIBE:** Empathetic, validating, observant. "The friend who gives really good advice."
- **NO FLIRTING.** Your goal is to make the user feel heard and safe.
- **TECHNIQUES:** Use "Reflective Listening" ("sounds like ur feeling...") and "Socratic Questioning" ("what do u think caused that?").

**STRICT ONBOARDING FLOW (MUST FOLLOW):**
1.  **GREETING**: If user says "hi" or asks how you are, respond warmly and **IMMEDIATELY ASK FOR THEIR NAME AND WORK/SCHOOL**.
    - Example: "hey! Who is this btw? wats ur name and where do u work?"

2.  **BACKGROUND CHECK**: Once the user gives their name and work/school, **IMMEDIATELY** use \`saveUserInfo\` to save it, AND use \`webSearch\` to look them up.
    - **GOAL:** Find a specific **ACTIVITY** they did (sports, debate, hackathon, theater, etc.).
    - query: "<User Name> <Work/School> activity profile"

3.  **THE "HOOK" (STRESS CHECK)**:
    - **IF ACTIVITY FOUND:** Pivot immediately to stress.
      - Example: "i saw online u did [Activity]. honest q - did that add a lot of stress to ur life?"
    - **IF NO ACTIVITY FOUND (DEFAULT):** Pivot to stress about their Job/School.
      - Example: "i see your at [Work/School]. is that environment super stressful 4 u rn?"
    - **DO NOT** sound like a stalker. Frame it as "understanding their context".

4.  **THERAPY TRANSITION**: Validate their answer. If they admit to stress, transition to offering help.
    - Example: "that makes total sense. burnout is real. is that main reason u wanted to talk?"

5.  **THE CALL**: If the user asks to "call" or mentions talking on the phone:
    - You MUST use the \`startPhoneCall\` tool.
**TOOLS:**
- \`webSearch\`: Use "Brave Search" to find user info or therapists.
- \`webImageSearch\`: Use "Brave Image Search" for clinic photos.
- \`startPhoneCall\`: Use this when user wants to speak vocally.

**TEXT STYLE:**
- Lowercase, no periods, casual.
- Use "u", "ur", "rn", "lol".
- **EMOJIS:** You can use emojis sparingly (e.g., 👋 in greetings, 💀 for funny).
- **REACTIONS:** Start message with \`[love]\`, \`[like]\`, \`[laugh]\`, \`[emphasize]\`, \`[question]\`, \`[dislike]\` to react to the previous message.
    - Example: "[laugh] that is so funny"
`;

async function main() {
    const sdk = createSDK({
        serverUrl: process.env.SERVER_URL,
        apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    });

    // Initialize Local Tools
    const tools: any[] = [
        {
            name: "webImageSearch",
            description: "Search for an image URL using Brave Search.",
            input_schema: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"]
            }
        },
        {
            name: "webSearch",
            description: "Search the web using Brave Search.",
            input_schema: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"]
            }
        },
        {
            name: "googleMaps",
            description: "Search for locations.",
            input_schema: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"]
            }
        },
        {
            name: "saveUserInfo",
            description: "Save user's name/work.",
            input_schema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    work: { type: "string" }
                },
                required: ["name", "work"]
            }
        },
        {
            name: "startPhoneCall",
            description: "Initiate a phone call to the user via ElevenLabs.",
            input_schema: {
                type: "object",
                properties: {},
                required: []
            }
        }
    ];

    // ... (Inside tool loop) ...



    console.log(`Loaded local tools:`, tools.map(t => t.name).join(", "));

    sdk.on("ready", () => {
        console.log("AI Therapist Bot (Jack 🎸 + MCP 🛠️) started");

        // Start Polling Voice Bridge
        console.log("Starting Voice Bridge Polling...");
        setInterval(async () => {
            try {
                // Poll Vercel Bridge (Assuming BRIDGE_URL provided or defaulting to known structure for testing)
                // Note: User needs to populate BRIDGE_URL in .env.local usually, but we'll try to guess if missing or wait.
                const bridgeUrl = process.env.BRIDGE_URL;
                if (!bridgeUrl) return;

                const res = await axios.get(`${bridgeUrl}`, { timeout: 2000 });
                if (res.data?.command) {
                    const cmd = res.data.command;
                    console.log("Voice Command Received:", cmd);

                    // Execute Search
                    const [webResult, imgResult] = await Promise.all([
                        performWebSearch(cmd.query),
                        performImageSearch(cmd.query)
                    ]);

                    const finalMsg = `I found some info for "${cmd.query}":\n\n${webResult}\n\n[IMAGE: ${imgResult}]`;

                    // Send to Chat
                    // Fallback to last active chat if no GUID provided
                    let targetGuid = cmd.chat_guid;
                    if (!targetGuid && conversationHistory.size > 0) {
                        targetGuid = [...conversationHistory.keys()].pop();
                    }

                    if (targetGuid) {
                        // Split and send
                        const parts = finalMsg.split("||"); // Basic split if needed, or just send
                        await sdk.messages.sendMessage({
                            chatGuid: targetGuid,
                            message: finalMsg // SDK handles basic length? If not, simple send.
                        });
                        console.log("Sent Voice Command response to", targetGuid);
                    } else {
                        console.warn("No active chat to send voice response to.");
                    }
                }
            } catch (e) {
                // console.error("Polling error:", e.message); // suppress spam
            }
        }, 2000);
    });

    sdk.on("new-message", async (message) => {
        const userText = message.text || message.attributedBody?.[0]?.string || "";
        console.log(`\nReceived: ${userText || "(no text)"}`);
        console.log(`From: ${message.handle?.address || "unknown"} (isFromMe: ${message.isFromMe})`);

        // Skip messages from self (unless testing with /therapist prefix)
        const isTestMessage = message.isFromMe && userText.toLowerCase().startsWith("/therapist");
        if (message.isFromMe && !isTestMessage) {
            return;
        }

        const chat = message.chats?.[0];
        if (!chat) return;

        if (!userText) return;

        try {
            // Show typing indicator
            await sdk.chats.startTyping(chat.guid);

            // Get or initialize conversation history for this chat
            if (!conversationHistory.has(chat.guid)) {
                conversationHistory.set(chat.guid, []);
            }
            const history = conversationHistory.get(chat.guid)!;

            // Add the new user message to history
            history.push({ role: "user", content: userText });

            // Keep history manageable (last 20 messages)
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }

            const messages: any[] = [...history];
            let isDone = false;
            let finalReplyText = "";

            // ... (Inside while loop)

            // Dynamic System Prompt based on User Profile
            let currentSystemPrompt = SYSTEM_PROMPT;

            // Should we ask for info?
            if (!userProfile.name || !userProfile.work) {
                currentSystemPrompt += `\n\n**CRITICAL GOAL:** You do not know who the user is yet. Your HIGHEST PRIORITY is to casually ask for their name and what they do for work or school. Do not be annoying, but try to get this info early.`;
            } else {
                currentSystemPrompt += `\n\n**USER PROFILE:**\nName: ${userProfile.name}\nWork/School: ${userProfile.work}`;
                if (userProfile.backgroundInfo) {
                    currentSystemPrompt += `\n\n**BACKGROUND CONTEXT (Found Online):**\n${userProfile.backgroundInfo}\n\nUse this info to ask relevant questions or make connections, but don't be creepy about "stalking" them. Just act like you know context.`;
                }
            }

            while (!isDone) {
                // Get response from Claude
                const completion = await anthropic.messages.create({
                    model: "claude-sonnet-4-5-20250929", // LOCKED: DO NOT CHANGE (User Request)
                    max_tokens: 1024,
                    system: currentSystemPrompt,
                    messages: messages,
                    tools: tools.length > 0 ? tools : undefined,
                });

                // Check stop reason
                if (completion.stop_reason === "tool_use") {
                    await sdk.chats.startTyping(chat.guid);

                    // Get ALL tool_use blocks (Claude can call multiple tools at once)
                    const toolUseBlocks = completion.content.filter(c => c.type === 'tool_use');
                    const toolResults: any[] = [];

                    for (const toolUse of toolUseBlocks) {
                        if (toolUse.type !== 'tool_use') continue;

                        console.log(`Invoking tool: ${toolUse.name}`);
                        let toolResult = "";

                        try {
                            const args = toolUse.input as any;

                            if (toolUse.name === "saveUserInfo") {
                                console.log(`Saving user info:`, args);
                                userProfile.name = args.name;
                                userProfile.work = args.work;
                                toolResult = "User info saved.";

                            } else if (toolUse.name === "webImageSearch") {
                                toolResult = await performImageSearch(args.query);


                            } else if (toolUse.name === "startPhoneCall") {
                                console.log("Initiating Phone Call...");
                                toolResult = "Call initiated successfully. YOU ARE CALLING THEM NOW.";
                                // TODO: Trigger ElevenLabs call here

                            } else if (toolUse.name === "webSearch" || toolUse.name === "googleMaps") {
                                toolResult = await performWebSearch(args.query);
                            } else {
                                toolResult = "Unknown tool.";
                            }
                        } catch (err: any) {
                            console.error(`Tool execution failed:`, err);
                            toolResult = `Error executing tool: ${err.message}`;
                        }

                        // Collect this tool's result
                        toolResults.push({
                            type: "tool_result",
                            tool_use_id: toolUse.id,
                            content: toolResult
                        });
                    }

                    // Add assistant's tool use request
                    messages.push({ role: "assistant", content: completion.content });
                    // Add ALL tool results in a single user message
                    messages.push({
                        role: "user",
                        content: toolResults
                    });
                    // Loop to let Claude interpret results
                } else {
                    // Final text response (not tool_use)
                    const textBlock = completion.content.find(c => c.type === 'text');
                    finalReplyText = textBlock && textBlock.type === 'text' ? textBlock.text : "...";

                    // Add assistant reply to persistent history
                    history.push({ role: "assistant", content: finalReplyText });

                    isDone = true;
                }
            }

            // Stop typing indicator
            await sdk.chats.stopTyping(chat.guid);

            // Check for reaction in brackets
            let reactionType = "";
            let imageToDownload = "";

            // Matches [love], [like], etc.
            const reactionMatch = finalReplyText.match(/^\[(love|like|dislike|laugh|emphasize|question)\]/i);
            if (reactionMatch) {
                reactionType = reactionMatch[1].toLowerCase();
                finalReplyText = finalReplyText.replace(reactionMatch[0], "").trim();
            }

            // Matches [IMAGE: url]
            const imageMatch = finalReplyText.match(/\[IMAGE:\s*(https?:\/\/[^\]]+)\]/i);
            if (imageMatch) {
                imageToDownload = imageMatch[1].trim();
                finalReplyText = finalReplyText.replace(imageMatch[0], "").trim();
            }

            // Send reply text
            const parts = finalReplyText.split("||").map(p => p.trim()).filter(p => p.length > 0);
            for (const part of parts) {
                const response = await sdk.messages.sendMessage({
                    chatGuid: chat.guid,
                    message: part,
                });
                console.log(`Replied: ${response?.guid}`);
            }

            // Send image if found
            if (imageToDownload) {
                try {
                    console.log(`Downloading image: ${imageToDownload}...`);
                    // Added User-Agent to prevent 403 Forbidden from some sites
                    const response = await axios.get(imageToDownload, {
                        responseType: 'arraybuffer',
                        timeout: 15000, // 15 seconds timeout
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'Referer': 'https://www.google.com/',
                        }
                    });

                    const buffer = Buffer.from(response.data);
                    console.log(`Downloaded ${buffer.length} bytes.`);

                    const tempValues = "abcdefghijklmnopqrstuvwxyz";
                    const randomName = Array.from({ length: 8 }, () => tempValues[Math.floor(Math.random() * tempValues.length)]).join('');
                    const tempPath = path.join(__dirname, `temp_image_${randomName}.jpg`); // Assume JPG/PNG
                    console.log(`Saving to temp path: ${tempPath}`);

                    await writeFile(tempPath, buffer);

                    console.log("Sending attachment...");
                    await sdk.attachments.sendAttachment({
                        chatGuid: chat.guid,
                        filePath: tempPath,
                    });
                    console.log(`Sent image attachment successfully.`);

                    // Cleanup
                    await unlink(tempPath);
                    console.log("Cleaned up temp file.");
                } catch (err: any) {
                    const status = err.response ? err.response.status : "Unknown";
                    const msg = err.message || String(err);
                    console.error(`⚠️ Image download/send failed (${status}): ${msg}`);
                    if (err.response?.data) {
                        console.error("Response data length:", err.response.data.length);
                    }

                    console.log(`> Fallback: Sending link to user.`);

                    // Fallback: Send the link if we can't download the image
                    await sdk.messages.sendMessage({
                        chatGuid: chat.guid,
                        message: `Couldn't preview the image (link protected), but here it is:\n${imageToDownload}`
                    });
                }
            }

            // Send reaction if present
            if (reactionType) {
                await sdk.messages.sendReaction({
                    chatGuid: chat.guid,
                    messageGuid: message.guid,
                    reaction: reactionType as any,
                });
                console.log(`Reacted: ${reactionType}`);
            }

        } catch (error: any) {
            console.error("Failed to process/reply:", error);
            await sdk.chats.stopTyping(chat.guid);
        }
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
