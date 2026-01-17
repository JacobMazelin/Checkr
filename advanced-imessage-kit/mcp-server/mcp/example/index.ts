import { Tool, Resource, Prompt, SchemaConstraint, Optional } from "@leanmcp/core";
import axios from "axios";
import { search, SafeSearchType } from "duck-duck-scrape";

class WebSearchInput {
  @SchemaConstraint({ description: "The query to search for" })
  query!: string;
}

class MapSearchInput {
  @SchemaConstraint({ description: "Location or query to search on maps" })
  query!: string;
}

export class GeneralTools {
  @Tool({
    description: "Search the internet for information using DuckDuckGo (Free)",
    inputClass: WebSearchInput
  })
  async webSearch(input: WebSearchInput) {
    try {
      console.log(`Searching DuckDuckGo for: ${input.query}`);
      const results = await search(input.query, {
        safeSearch: SafeSearchType.MODERATE
      });

      if (!results.results || results.results.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No results found." }]
        };
      }

      // Format top 3 results
      const formattedResults = results.results.slice(0, 3).map((r: any) =>
        `Title: ${r.title}\nLink: ${r.url}\nSnippet: ${r.description}`
      ).join("\n\n");

      return {
        content: [{ type: "text" as const, text: formattedResults }]
      };
    } catch (error: any) {
      console.error("DuckDuckGo search failed:", error);
      return {
        content: [{ type: "text" as const, text: `Search failed: ${error.message}` }]
      };
    }
  }

  @Tool({
    description: "Find locations or directions using OpenStreetMap (Free)",
    inputClass: MapSearchInput
  })
  async googleMaps(input: MapSearchInput) { // Keeping name 'googleMaps' so bot doesn't need prompt update, but implementation is OSM
    try {
      // Use Nominatim API (OpenStreetMap)
      // Must send a User-Agent as per TOU
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input.query)}&format=json&limit=3`;
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "TherapistBot/1.0 (internal-project)"
        }
      });

      const places = response.data;
      if (!places || places.length === 0) {
        return {
          content: [{ type: "text" as const, text: `No locations found for "${input.query}".` }]
        };
      }

      const formattedPlaces = places.map((p: any) =>
        `Name: ${p.display_name}\nLat/Lon: ${p.lat}, ${p.lon}\nType: ${p.type}`
      ).join("\n---\n");

      return {
        content: [{
          type: "text" as const,
          text: `Found locations (OSM):\n${formattedPlaces}\n\nMap Link: https://www.openstreetmap.org/search?query=${encodeURIComponent(input.query)}`
        }]
      };

    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `Map search failed: ${error.message}`
        }]
      };
    }
  }

  @Tool({
    description: "Find an image of a place or thing using DuckDuckGo (Free). Returns a URL.",
    inputClass: WebSearchInput
  })
  async webImageSearch(input: WebSearchInput) {
    try {
      console.log(`Searching DuckDuckGo Images for: ${input.query}`);
      const results = await search(input.query, {
        searchType: "image",
        safeSearch: SafeSearchType.MODERATE
      } as any);

      if (!results.results || results.results.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No images found." }]
        };
      }

      // Return top result URL
      const topImage = results.results[0] as any;
      return {
        content: [{ type: "text" as const, text: `Image URL: ${topImage.image}` }]
      };

    } catch (error: any) {
      console.error("DuckDuckGo image search failed:", error);
      return {
        content: [{ type: "text" as const, text: `Image search failed: ${error.message}` }]
      };
    }
  }

  @Resource({ description: "Get server information" })
  async serverInfo() {
    return {
      contents: [{
        uri: "server://info",
        mimeType: "application/json",
        text: JSON.stringify({
          name: "mcp-server",
          version: "1.0.0",
          uptime: process.uptime()
        }, null, 2)
      }]
    };
  }
}
