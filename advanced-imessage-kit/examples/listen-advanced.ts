import { getOptionTextById, isPollMessage, isPollVote, parsePollDefinition, parsePollVotes } from "../lib/poll-utils";
import { createSDK, handleError, handleExit } from "./utils";

async function main() {
    const sdk = createSDK({ logLevel: "debug" });

    sdk.on("ready", async () => {
        try {
            const chatList = await sdk.chats.getChats();
            console.log(`${chatList.length} chats:`);
            chatList.slice(0, 10).forEach((chat, i) => {
                console.log(`  ${i + 1}. ${chat.displayName || chat.chatIdentifier}`);
            });

            if (chatList.length > 0) {
                const chat = chatList[0];
                if (chat) {
                    console.log(
                        `\n${chat.displayName || chat.chatIdentifier} (${chat.participants?.length || 0} people)`,
                    );
                }
            }

            const serverInfo = await sdk.server.getServerInfo();
            console.log(`\n${JSON.stringify(serverInfo, null, 2)}`);
        } catch (error) {
            handleError(error, "Setup failed");
        }
    });

    sdk.on("new-message", (message) => {
        if (isPollMessage(message)) {
            if (isPollVote(message)) {
                const voteData = parsePollVotes(message);
                const votesWithText = voteData?.votes.map((v) => ({
                    ...v,
                    optionText: getOptionTextById(v.voteOptionIdentifier) ?? null,
                }));
                console.log(`\n${JSON.stringify({ ...message, parsedVotes: votesWithText }, null, 2)}`);
            } else {
                const pollData = parsePollDefinition(message);
                console.log(`\n${JSON.stringify({ ...message, parsedPoll: pollData }, null, 2)}`);
            }
        } else {
            console.log(`\n${JSON.stringify(message, null, 2)}`);
        }
    });

    sdk.on("typing-indicator", () => {
        console.log("typing");
    });

    sdk.on("group-icon-changed", () => {
        console.log("icon changed");
    });

    sdk.on("config-update", () => {
        console.log("config updated");
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
