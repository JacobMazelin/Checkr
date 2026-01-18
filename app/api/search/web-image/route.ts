import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface SearchInput {
    query: string
}

async function performImageSearch(query: string): Promise<string> {
    try {
        const response = await axios.get("https://api.search.brave.com/res/v1/images/search", {
            params: { q: query },
            headers: {
                Accept: "application/json",
                "X-Subscription-Token": process.env.BRAVE_API_KEY
            },
            timeout: 10000,
        });

        const images = response.data.results || [];
        if (!images.length) return "";

        // Use thumbnail.src for the image URL
        return images[0].thumbnail?.src || images[0].url || "";
    } catch (err: any) {
        console.error("Image search failed:", err.message);
        return "";
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
        const imageUrl = await performImageSearch(query);

        return NextResponse.json({
            success: true,
            query,
            imageUrl,
            hasImage: !!imageUrl
        });

    } catch (error: any) {
        console.error("Web+Image search error:", error.message);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
