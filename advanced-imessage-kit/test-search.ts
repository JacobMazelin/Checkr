import { search, SafeSearchType } from "duck-duck-scrape";

async function testSearch() {
    console.log("Testing DuckDuckGo search...");

    const queries = [
        "therapist Pittsburgh PA",
        "coffee shop near me",
        "best pizza in New York"
    ];

    for (const query of queries) {
        console.log(`\n--- Searching: "${query}" ---`);
        try {
            const results = await search(query, { safeSearch: SafeSearchType.STRICT });
            console.log(`Found ${results.results.length} results`);
            results.results.slice(0, 3).forEach((r, i) => {
                console.log(`${i + 1}. ${r.title}`);
                console.log(`   ${r.url}`);
            });
        } catch (e: any) {
            console.error(`FAILED: ${e.message}`);
        }

        // Wait 3 seconds between searches to avoid rate limiting
        console.log("Waiting 3 seconds...");
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

testSearch();
