import axios from "axios";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env.local") });

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

console.log("BRAVE_API_KEY set:", BRAVE_API_KEY ? "Yes" : "No");
console.log("Key preview:", BRAVE_API_KEY ? `${BRAVE_API_KEY.substring(0, 10)}...` : "N/A");

async function testBraveSearch() {
    const query = "anmol singh umich";
    console.log(`\nTesting Brave Search with query: "${query}"\n`);

    try {
        const response = await axios.get("https://api.search.brave.com/res/v1/web/search", {
            params: { q: query, count: 5 },
            headers: {
                Accept: "application/json",
                "X-Subscription-Token": BRAVE_API_KEY,
            },
            timeout: 10000,
        });

        console.log("Status:", response.status);
        console.log("Results found:", response.data.web?.length || 0);
        console.log("\n--- Results ---\n");

        const results = response.data.web || [];
        results.slice(0, 5).forEach((r: any, i: number) => {
            console.log(`${i + 1}. ${r.title}`);
            console.log(`   URL: ${r.url}`);
            console.log(`   Description: ${r.description || "(none)"}`);
            console.log("");
        });

        // Format like the bot does
        const backgroundLines = results
            .slice(0, 3)
            .map((r: any) => `• ${r.title}: ${r.description || ""}`)
            .join("\n");

        console.log("--- Formatted Output (as bot would send) ---");
        console.log(backgroundLines);

        if (results.length === 0) {
            console.log("❌ NO RESULTS FOUND");
        } else {
            console.log(`\n✅ SUCCESS: Found ${results.length} results`);
        }
    } catch (err: any) {
        console.error("❌ SEARCH FAILED:");
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

testBraveSearch();
