import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Poll creation and add option example...\n");

        try {
            console.log("Step 1: Creating a poll with 2 options...");
            const pollMessage = await sdk.polls.create({
                chatGuid: CHAT_GUID,
                title: "",
                options: ["Option A", "Option B"],
            });

            console.log("✓ Poll created!");
            console.log(`Poll GUID: ${pollMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("\nStep 2: Adding a new option...");
            const editMessage = await sdk.polls.addOption({
                chatGuid: CHAT_GUID,
                pollMessageGuid: pollMessage.guid,
                optionText: "Option C - Added Later",
            });

            console.log("✓ Option added!");
            console.log(`Edit message GUID: ${editMessage.guid}`);
            console.log(`Associated Message Type: ${editMessage.associatedMessageType}`);
        } catch (error) {
            handleError(error, "Poll operation failed");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
