import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            console.log(`Checking background for chat: ${CHAT_GUID}`);

            // First, get the current background info
            const backgroundInfo = await sdk.chats.getBackground(CHAT_GUID);

            if (!backgroundInfo.hasBackground) {
                console.log("Chat does not have a background set.");
                await sdk.close();
                process.exit(0);
                return;
            }

            console.log("Current background info:");
            console.log(`  Has background: ${backgroundInfo.hasBackground}`);
            console.log(`  Background ID: ${backgroundInfo.backgroundId}`);
            console.log(`  Image URL: ${backgroundInfo.imageUrl}`);

            // Remove the background
            console.log("\nRemoving background...");
            await sdk.chats.removeBackground(CHAT_GUID);
            console.log("Background removed successfully!");

            // Verify removal
            const newBackgroundInfo = await sdk.chats.getBackground(CHAT_GUID);
            console.log(`\nVerification - Has background: ${newBackgroundInfo.hasBackground}`);
        } catch (error) {
            handleError(error, "Failed to remove background");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
