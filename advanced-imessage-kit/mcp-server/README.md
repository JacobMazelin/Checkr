<p align="center">
  <img
    src="https://raw.githubusercontent.com/LeanMCP/leanmcp-sdk/refs/heads/main/assets/logo.svg"
    alt="LeanMCP Logo"
    width="500"
  />
</p>

<p align="center">
  <a href="https://ship.leanmcp.com">
    <img src="https://raw.githubusercontent.com/LeanMCP/leanmcp-sdk/refs/heads/main/badges/deploy.svg" alt="Deploy on LeanMCP" height="30">
  </a>
  <a href="https://ship.leanmcp.com/playground">
    <img src="https://raw.githubusercontent.com/LeanMCP/leanmcp-sdk/refs/heads/main/badges/test.svg" alt="Test on LeanMCP" height="30">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@leanmcp/core">
    <img src="https://img.shields.io/npm/v/@leanmcp/core" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@leanmcp/cli">
    <img src="https://img.shields.io/npm/dm/@leanmcp/cli" alt="npm downloads" />
  </a>
  <a href="https://leanmcp.com/">
    <img src="https://img.shields.io/badge/Website-leanmcp-0A66C2?" />
  </a>
  <a href="https://discord.com/invite/DsRcA3GwPy">
    <img src="https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white" />
  </a>
  <a href="https://x.com/LeanMcp">
    <img src="https://img.shields.io/badge/@LeanMCP-f5f5f5?logo=x&logoColor=000000" />
  </a>
  <a href="https://deepwiki.com/LeanMCP/leanmcp-sdk">
    <img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" />
  </a>
</p>

# MCP Server for Therapy Bot Calendar Integration

> **Built with [LeanMCP](https://leanmcp.com/)** - Model Context Protocol server for Google Calendar scheduling during ElevenLabs voice calls.

## 🎯 Overview

This MCP server enables therapy session scheduling during phone conversations. It provides three core tools:

1. **find_free_times_week** - Find all available time slots in user's calendar for the next 7 days
2. **create_therapist_meeting** - Book "Therapy Session" events in Google Calendar  
3. **send_text_confirmation** - Format confirmation messages for iMessage

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start server
npm run dev
```

Server runs on `http://localhost:3001`

## 📚 Documentation

- **[CALENDAR_SETUP.md](./CALENDAR_SETUP.md)** - Complete setup guide from scratch
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built and how it works
- **[FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md)** - Visual architecture and data flows
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common commands and troubleshooting

## ⚡ Features

- **Supabase Integration**: Securely retrieves user OAuth tokens by phone number
- **Smart Free Time Finder**: Analyzes next 7 days, excludes busy slots, returns business hours only
- **Google Calendar API**: Creates events with proper formatting and returns calendar links
- **Error Handling**: Graceful failures with detailed error messages
- **Auto-Discovery**: Services are automatically loaded from `./mcp` directory

## 🛠️ Available Tools

### 1. `find_free_times_week`
Finds all available time slots in the user's calendar for the next 7 days (weekdays, 9am-5pm).

**Input:**
```json
{
  "phone_number": "1234567890"
}
```

**Output:**
```
Found 15 free time slots this week:
Mon Jan 20 9:00 AM-10:00 AM
Mon Jan 20 10:00 AM-11:00 AM
Mon Jan 20 2:00 PM-3:00 PM
...
```

### 2. `create_therapist_meeting`
Creates a "Therapy Session" event in the user's Google Calendar.

**Input:**
```json
{
  "phone_number": "1234567890",
  "start_time": "2026-01-20T14:00:00-05:00",
  "end_time": "2026-01-20T15:00:00-05:00"
}
```

**Output:**
```
✅ Therapy session scheduled for Mon, Jan 20, 2:00 PM!
Calendar link: https://calendar.google.com/event?eid=...
```

### 3. `send_text_confirmation`
Sends a text confirmation message to the user via iMessage.

**Input:**
```json
{
  "phone_number": "1234567890",
  "message": "Your therapy session is confirmed for Monday, Jan 20 at 2:00 PM"
}
```

## 🔧 Environment Setup

Create a `.env` file with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🧪 Testing

```bash
# Run test suite
node test-calendar.js

# Test specific endpoint
curl -X POST http://localhost:3001/tools/find_free_times_week \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "1234567890"}'
```

## 🔗 Integration with ElevenLabs

1. Add MCP server URL to your ElevenLabs agent settings: `http://localhost:3001`
2. Update agent system prompt with calendar flow instructions (see [CALENDAR_SETUP.md](./CALENDAR_SETUP.md))
3. Test the flow with a phone call

**Example conversation:**
```
User: "I want to schedule a therapy session"
Agent: [calls find_free_times_week]
       "You're free Monday at 2pm, Tuesday at 10am, or Wednesday at 3pm. Which works?"
User: "Monday at 2pm"
Agent: [calls create_therapist_meeting]
       "Perfect! Your therapy session is booked for Monday at 2pm."
       [calls send_text_confirmation]
User: [receives text confirmation]
```

## 🏗️ Architecture

```
ElevenLabs Voice Call
    ↓
MCP Server (Port 3001)
    ↓
Supabase (OAuth tokens)
    ↓
Google Calendar API
    ↓
Calendar event created + confirmation sent
```

## 📦 Project Structure

```
mcp-server/
├── main.ts                      # Server entry point
├── mcp/
│   └── google_calendar.ts       # Calendar tools implementation
├── test-calendar.js             # Test suite
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── docs/
    ├── CALENDAR_SETUP.md        # Setup guide
    ├── IMPLEMENTATION_SUMMARY.md # Technical details
    ├── FLOW_DIAGRAMS.md         # Visual flows
    └── QUICK_REFERENCE.md       # Command reference
```

## 🐛 Troubleshooting

### "No OAuth token found"
→ User needs to complete Google OAuth signup at your app's signup page

### "Failed to check calendar"  
→ OAuth token may be expired or invalid. User needs to re-authenticate

### "MCP server not responding"
→ Ensure server is running: `curl http://localhost:3001`

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for more troubleshooting tips.

## 🚢 Production Deployment

Deploy to any Node.js hosting platform:
- Railway
- Render  
- Fly.io
- Heroku

Update ElevenLabs agent with your production MCP server URL.

## 📋 Requirements

- Node.js 20+
- npm or yarn
- Supabase account with service role key
- Google Calendar API access via OAuth
- ElevenLabs voice agent (optional, for phone integration)

## 🔐 Security Notes

- OAuth tokens stored securely in Supabase
- Service role key required (not anon key)
- No RLS needed (service role bypasses)
- Never commit `.env` file to git

## 📄 License

MIT

## 🤝 Contributing

This is a prototype for NexHacks. Feel free to fork and improve!

## 🙏 Acknowledgments

- Built with [LeanMCP](https://leanmcp.com/)
- Uses Google Calendar API
- Integrated with [ElevenLabs](https://elevenlabs.io/) voice agents
- Database powered by [Supabase](https://supabase.com/)

---

**Need help?** Read [CALENDAR_SETUP.md](./CALENDAR_SETUP.md) for step-by-step instructions.

```
mcp-server/
├── main.ts              # Server entry point
├── mcp/                 # Services directory (auto-discovered)
│   └── example/
│       └── index.ts     # Example service
├── .env                 # Environment variables
└── package.json
```

## Adding New Services

Create a new service directory in `mcp/`:

```typescript
// mcp/myservice/index.ts
import { Tool, SchemaConstraint } from "@leanmcp/core";

// Define input schema
class MyToolInput {
  @SchemaConstraint({ 
    description: "Message to process",
    minLength: 1
  })
  message!: string;
}

export class MyService {
  @Tool({ 
    description: "My awesome tool",
    inputClass: MyToolInput
  })
  async myTool(input: MyToolInput) {
    return {
      content: [{
        type: "text",
        text: `You said: ${input.message}`
      }]
    };
  }
}
```

Services are automatically discovered and registered - no need to modify `main.ts`!

## Features

- **Zero-config auto-discovery** - Services automatically registered from `./mcp` directory
- **Type-safe decorators** - `@Tool`, `@Prompt`, `@Resource` with full TypeScript support
- **Schema validation** - Automatic input validation with `@SchemaConstraint`
- **HTTP transport** - Production-ready HTTP server with session management
- **Hot reload** - Development mode with automatic restart on file changes

## Deploy to LeanMCP Cloud

Deploy your MCP server to LeanMCP's global edge network with a single command:

```bash
# Login to LeanMCP (first time only)
leanmcp login

# Deploy your server
leanmcp deploy .
```

After deployment, your server will be available at:
- **URL**: `https://your-project.leanmcp.app`
- **Health**: `https://your-project.leanmcp.app/health`
- **MCP Endpoint**: `https://your-project.leanmcp.app/mcp`

Manage your deployments at [ship.leanmcp.com](https://ship.leanmcp.com)

## Testing with MCP Inspector

```bash
# Test locally
npx @modelcontextprotocol/inspector http://localhost:3001/mcp

# Test deployed server
npx @modelcontextprotocol/inspector https://your-project.leanmcp.app/mcp
```

## Support

-  [Documentation](https://docs.leanmcp.com)
-  [Discord Community](https://discord.com/invite/DsRcA3GwPy)
-  [Report Issues](https://github.com/leanmcp/leanmcp-sdk/issues)

## License

MIT
