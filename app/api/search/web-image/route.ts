import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface SearchInput {
    query: string
}

async function performWebSearch(query: string): Promise<any[]> {
    try {
        const response = await axios.get("https://api.search.brave.com/res/v1/web/search", {
            params: { q: query, count: 3 },
            headers: {
                Accept: "application/json",
                "X-Subscription-Token": process.env.BRAVE_API_KEY
            },
            timeout: 10000,
        });

        return response.data.web?.results || [];
    } catch (err: any) {
        console.error("[Web Search] Failed:", err.message);
        return [];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json() as SearchInput;

        if (!query) {
            return NextResponse.json(
                { error: 'Missing required parameter: query' },
                { status: 400 }
            );
        }

        if (!process.env.BRAVE_API_KEY) {
            return NextResponse.json(
                { error: 'BRAVE_API_KEY not configured' },
                { status: 500 }
            );
        }

        console.log(`[Web+Image Search] Searching for: "${query}"`);
        
        // Perform web search
        const webResults = await performWebSearch(query);

        // Format web results
        const webContent = webResults
            .map((r: any, i: number) => `${i + 1}. ${r.title}\n${r.description || "No description"}\nURL: ${r.url}`)
            .join("\n\n");

        return NextResponse.json({
            success: true,
            query,
            webResults: webContent,
            resultCount: webResults.length
        });

    } catch (error: any) {
        console.error("Web+Image search error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
