import path from "node:path";
import type { AttachmentResponse } from "../types";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const STICKER_PATH = process.env.STICKER_PATH || path.join(__dirname, "test-image.png");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Standalone Sticker Example\n");
        console.log("This sends a sticker as its own message (like sending an image).\n");

        try {
            console.log(`Sending standalone sticker to: ${CHAT_GUID}`);
            console.log(`Sticker file: ${STICKER_PATH}\n`);

            const stickerMessage = await sdk.attachments.sendSticker({
                chatGuid: CHAT_GUID,
                filePath: STICKER_PATH,
            });

            console.log("✓ Standalone sticker sent successfully!\n");
            console.log(`Message GUID: ${stickerMessage.guid}`);
            console.log(`Attachments: ${stickerMessage.attachments?.length || 0}`);

            if (stickerMessage.attachments?.[0]) {
                const attachment = stickerMessage.attachments[0] as AttachmentResponse;
                console.log(`\nAttachment details:`);
                console.log(`  - MIME type: ${attachment.mimeType || "unknown"}`);
                console.log(`  - Is sticker: ${attachment.isSticker || false}`);
                console.log(`  - Filename: ${attachment.transferName || "unknown"}`);
            }
        } catch (error) {
            handleError(error, "Failed to send standalone sticker");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
