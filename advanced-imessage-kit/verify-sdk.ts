import { SDK } from "./index";

const sdk = SDK({
    serverUrl: "https://e78yri.imsgd.photon.codes",
    apiKey: "AFSUsGhPPt72n5txn8e394k7",
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
