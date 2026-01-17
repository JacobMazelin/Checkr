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

            const isGroup = "style" in targetChat && targetChat.style === 43;
            if (!isGroup) {
                console.log(`"${GROUP_NAME}" is not a group chat. leaveChat only works for group chats.`);
                console.log("Use deleteChat instead to clear 1-on-1 chat history.");
                await sdk.close();
                process.exit(1);
            }

            console.log(`Found group chat: ${targetChat.displayName || targetChat.chatIdentifier}`);
            console.log(`  GUID: ${targetChat.guid}`);
            console.log(`  Participants: ${targetChat.participants?.length || 0}`);

            console.log("\nLeaving chat...");
            await sdk.chats.leaveChat(targetChat.guid);

            console.log("Successfully left the group chat!");
            console.log("Note: Chat history is preserved. Use deleteChat to also clear history.");
        } catch (error) {
            handleError(error, "Failed to leave chat");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
