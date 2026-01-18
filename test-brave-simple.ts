import axios from "axios";

const BRAVE_API_KEY = "BSALWd1bEvvfYw2mMzCPyncMG94PqMc";
const query = "anmol singh umich";

console.log(`Testing Brave Search with query: "${query}"\n`);
console.log(`API Key: ${BRAVE_API_KEY.substring(0, 10)}...\n`);

async function test() {
    try {
        console.log("Making request to Brave API...\n");
        
        const response = await axios.get("https://api.search.brave.com/res/v1/web/search", {
            params: { 
                q: query,
                count: 5 
            },
            headers: {
                "Accept": "application/json",
                "X-Subscription-Token": BRAVE_API_KEY,
            },
            timeout: 15000,
        });

        console.log("✅ Response received!");
        console.log("Status:", response.status);
        console.log("Results count:", response.data.web?.length || 0);
        console.log("\n--- Full Response ---");
        console.log(JSON.stringify(response.data, null, 2));

        const results = response.data.web || [];
        if (results.length > 0) {
            console.log("\n--- Formatted Results ---");
            results.slice(0, 3).forEach((r: any, i: number) => {
                console.log(`${i + 1}. ${r.title}`);
                console.log(`   ${r.description}`);
            });
        }
    } catch (err: any) {
        console.log("❌ Error occurred");
        console.error("Message:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Response:", err.response.data);
        } else {
            console.error("Full error:", err);
        }
    }
}

test();
