import { parsePollDefinition } from "../lib/poll-utils";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const POLL_MESSAGE_GUID = process.env.POLL_MESSAGE_GUID;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            let pollMessageGuid = POLL_MESSAGE_GUID;
            let optionIdentifier: string | undefined;

            if (!pollMessageGuid) {
                const poll = await sdk.polls.create({
                    chatGuid: CHAT_GUID,
                    title: "Vote test",
                    options: ["Option A", "Option B", "Option C"],
                });

                pollMessageGuid = poll.guid;
                console.log(`created poll: ${pollMessageGuid}`);

                const pollData = parsePollDefinition(poll);
                optionIdentifier = pollData?.options?.[0]?.optionIdentifier;
                console.log(`options: ${pollData?.options?.map((o) => o.text).join(", ")}`);

                await new Promise((resolve) => setTimeout(resolve, 2000));
            }

            if (!optionIdentifier) {
                const poll = await sdk.messages.getMessage(pollMessageGuid!, { with: ["payloadData"] });
                const pollData = parsePollDefinition(poll);
                optionIdentifier = pollData?.options?.[0]?.optionIdentifier;
            }

            if (!optionIdentifier) {
                throw new Error("Could not find option identifier");
            }

            const vote = await sdk.polls.vote({
                chatGuid: CHAT_GUID,
                pollMessageGuid: pollMessageGuid!,
                optionIdentifier,
            });

            console.log(`voted: ${vote.guid}`);
        } catch (error) {
            handleError(error, "Failed to vote");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
