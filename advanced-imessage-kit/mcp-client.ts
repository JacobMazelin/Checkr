import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export class McpManager {
    private client: Client | null = null;
    private transport: Transport | null = null;
    private apiKey: string;
    private serverUrl: string;

    constructor() {
        this.apiKey = process.env.LEAN_MCP_API_KEY || "";
        this.serverUrl = process.env.LEAN_MCP_URL || "";
    }

    async connect() {
        if (!this.serverUrl) {
            console.warn("⚠️ LEAN_MCP_URL is not set. MCP integration disabled.");
            return;
        }

        // Auto-fix common URL mistake (LeanMCP default is /sse)
        if (this.serverUrl.endsWith("/mcp")) {
            this.serverUrl = this.serverUrl.replace("/mcp", "/sse");
        }

        console.log(`🔌 Connecting to Lean MCP at ${this.serverUrl}...`);

        try {
            const url = new URL(this.serverUrl);
            const transport = url.protocol === 'ws:' || url.protocol === 'wss:'
                ? new WebSocketClientTransport(url)
                : new SSEClientTransport(url, {
                    eventSourceInit: {
                        headers: {
                            "Authorization": `Bearer ${this.apiKey}`,
                            "X-API-Key": this.apiKey
                        }
                    },
                    requestInit: {
                        headers: {
                            "Authorization": `Bearer ${this.apiKey}`,
                            "X-API-Key": this.apiKey
                        }
                    }
                });

            this.transport = transport;
            this.client = new Client({
                name: "therapist-bot",
                version: "1.0.0",
            }, {
                capabilities: {}
            });

            await this.client.connect(transport);
            console.log("✅ Connected to Lean MCP!");

        } catch (error) {
            console.error("❌ Failed to connect to Lean MCP:", error);
            this.client = null;
        }
    }

    async getTools(): Promise<any[]> {
        if (!this.client) return [];
        try {
            const result = await this.client.listTools();
            // Convert MCP tools to Anthropic tools format if needed, 
            // but Anthropic SDK might take a slightly different schema. 
            // MCP Tool: { name, description, inputSchema }
            // Anthropic Tool: { name, description, input_schema }

            return result.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema
            }));
        } catch (error) {
            console.error("Failed to list tools:", error);
            return [];
        }
    }

    async callTool(name: string, args: any) {
        if (!this.client) throw new Error("MCP Client not connected");

        console.log(`🛠️ Calling tool: ${name} with args:`, args);
        const result = await this.client.callTool({
            name,
            arguments: args
        });

        // Result content is array of TextContent | ImageContent
        // We typically just want the text for the LLM
        if (result.content && Array.isArray(result.content)) {
            return result.content.map(c => c.type === 'text' ? c.text : '').join("\n");
        }
        return JSON.stringify(result);
    }

    async close() {
        if (this.transport) {
            await this.transport.close();
        }
    }
}
