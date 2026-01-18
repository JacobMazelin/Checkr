import * as dotenv from "dotenv";
import path from "path";
import { SDK } from "./index";

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

const sdk = SDK({
    serverUrl: process.env.SERVER_URL || "http://localhost:1234",
    apiKey: process.env.PHOTON_API_KEY || process.env.API_KEY,
});

console.log("Connecting to server...");
await sdk.connect();

console.log("Waiting for ready...");
await new Promise<void>((resolve) => {
    sdk.on("ready", () => resolve());
    sdk.on("error", (err) => {
        console.error("Error:", err);
        process.exit(1);
    });
});

console.log("Connected! Fetching server info...");
const info = await sdk.server.getServerInfo();
console.log("Server Info:", JSON.stringify(info, null, 2));

process.exit(0);
