import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Poll creation example...\n");

        try {
            console.log("Creating a poll...");
            const pollMessage = await sdk.polls.create({
                chatGuid: CHAT_GUID,
                title: "",
                options: [
                    "Option A - First choice",
                    "Option B - Second choice",
                    "Option C - Third choice",
                    "Option D - Fourth choice",
                ],
            });

            console.log("\n✓ Poll created successfully!");
            console.log(`Poll message GUID: ${pollMessage.guid}`);
            console.log(`Balloon Bundle ID: ${pollMessage.balloonBundleId}`);

            if (pollMessage.payloadData) {
                console.log(`\nPayload Data: ${JSON.stringify(pollMessage.payloadData, null, 2)}`);
            }
        } catch (error) {
            handleError(error, "Failed to create poll");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
