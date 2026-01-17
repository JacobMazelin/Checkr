import { createSDK, handleError } from "./utils";

const GROUP_NAME = "Test Group";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const allChats = await sdk.chats.getChats();

            const targetChat = allChats.find(
                (chat) => chat.displayName === GROUP_NAME || chat.chatIdentifier === GROUP_NAME,
            );

            if (!targetChat) {
                console.log(`Group chat "${GROUP_NAME}" not found.`);
                console.log("\nAvailable group chats:");

                const groups = allChats.filter((chat) => "style" in chat && chat.style === 43);
                groups.forEach((group, i) => {
                    console.log(`  ${i + 1}. ${group.displayName || group.chatIdentifier}`);
                });

                await sdk.close();
                process.exit(1);
            }

            console.log(`Found group chat: ${targetChat.displayName || targetChat.chatIdentifier}`);
            console.log(`  GUID: ${targetChat.guid}`);
            console.log(`  Participants: ${targetChat.participants?.length || 0}`);

            console.log("\nDeleting chat...");
            await sdk.chats.deleteChat(targetChat.guid);

            console.log("Successfully deleted (and left) the group chat!");
        } catch (error) {
            handleError(error, "Failed to delete chat");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
