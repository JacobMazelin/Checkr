import axios from "axios";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

console.log("SERPER_API_KEY:", process.env.SERPER_API_KEY ? `Set (${process.env.SERPER_API_KEY.substring(0, 8)}...)` : "NOT SET");

async function testSerper() {
    const query = "therapist Pittsburgh PA";
    console.log(`\nSearching for: "${query}"`);

    try {
        const response = await axios.post(
            'https://google.serper.dev/search',
            { q: query, num: 5 },
            {
                headers: {
                    'X-API-KEY': process.env.SERPER_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("SUCCESS!");
        console.log("Results:", response.data.organic?.slice(0, 3).map((r: any) => r.title));
    } catch (e: any) {
        console.error("FAILED:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

testSerper();
