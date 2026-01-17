import { createSDK, handleExit } from "./examples/utils";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function main() {
    const sdk = createSDK({
        serverUrl: process.env.SERVER_URL,
        apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
    });

    await sdk.connect();

    console.log("Fetching server info...");
    try {
        const info = await sdk.server.getServerInfo();
        console.log("\n--- SERVER INFO ---");
        console.log("OS Version:", info.os_version);
        console.log("Server Version:", info.server_version);
        console.log("Detected iCloud:", info.detected_icloud);
        console.log("-------------------\n");

        console.log("If 'Detected iCloud' is shown, please text THAT email address to test the bot.");
    } catch (err) {
        console.error("Failed to get server info:", err);
    }

    await sdk.close();
    process.exit(0);
}

main().catch(console.error);
