import fs from "node:fs";
import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const IMAGE_PATH = process.env.IMAGE_PATH || path.join(__dirname, "test-image.png");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            if (!fs.existsSync(IMAGE_PATH)) {
                console.error(`File not found: ${IMAGE_PATH}`);
                await sdk.close();
                process.exit(1);
            }

            console.log(`Setting background for chat: ${CHAT_GUID}`);
            console.log(`Using image: ${IMAGE_PATH}`);

            const currentBg = await sdk.chats.getBackground(CHAT_GUID);
            console.log("\nCurrent background info:");
            console.log(`  Has background: ${currentBg.hasBackground}`);
            if (currentBg.hasBackground) {
                console.log(`  Background ID: ${currentBg.backgroundId}`);
                console.log(`  Image URL: ${currentBg.imageUrl}`);
            }

            console.log("\nSetting new background...");
            await sdk.chats.setBackground(CHAT_GUID, {
                filePath: IMAGE_PATH,
            });

            console.log("Background set successfully!");

            console.log("\nVerifying new background...");
            const newBg = await sdk.chats.getBackground(CHAT_GUID);
            console.log("New background info:");
            console.log(`  Has background: ${newBg.hasBackground}`);
            if (newBg.hasBackground) {
                console.log(`  Background ID: ${newBg.backgroundId}`);
                console.log(`  Image URL: ${newBg.imageUrl}`);
            }
        } catch (error) {
            handleError(error, "Failed to set background");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
