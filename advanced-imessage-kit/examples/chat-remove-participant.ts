import { createSDK } from "./utils";

const GROUP_NAME = "Test Group";
const ADDRESS_TO_REMOVE = "+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const chats = await sdk.chats.getChats();
            const chat = chats.find((c) => c.displayName === GROUP_NAME || c.chatIdentifier === GROUP_NAME);

            if (!chat) {
                console.log(`Group "${GROUP_NAME}" not found`);
                process.exit(1);
            }

            console.log(`Removing ${ADDRESS_TO_REMOVE} from "${chat.displayName}"...`);
            const result = await sdk.chats.removeParticipant(chat.guid, ADDRESS_TO_REMOVE);
            console.log(`Done! Members: ${result.participants?.map((p) => p.address).join(", ")}`);
        } catch (e: any) {
            console.error("Failed:", e.response?.data?.error?.message || e.message);
        }
        await sdk.close();
    });

    await sdk.connect();
}

main();
