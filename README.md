# Demo: [https://devpost.com/software/checkr-esikfo](https://devpost.com/software/checkr-esikfo)

# Next.js + FastAPI on Vercel

A full-stack application combining Next.js (frontend) with FastAPI (backend) deployed as serverless functions on Vercel.

## Project Structure

```
.
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── api/                 # FastAPI backend (deployed as Vercel Functions)
│   └── index.py         # Main FastAPI application
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── package.json         # Node.js dependencies
├── requirements.txt     # Python dependencies
└── vercel.json         # Vercel deployment configuration
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.12), deployed as Vercel Serverless Functions
- **Deployment**: Vercel (both frontend and backend)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+ (or 3.8+)
- Vercel CLI (optional but recommended)

### Backend Setup (FastAPI)

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI development server:
   ```bash
   uvicorn api.index:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000/api`

### Frontend Setup (Next.js)

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Run the Next.js development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### Using Vercel CLI (Recommended)

The easiest way to run both frontend and backend together locally:

```bash
npm install -g vercel
vercel dev
```

This will automatically:
- Start the Next.js dev server
- Run the FastAPI backend as a serverless function
- Handle routing between frontend and API

## API Endpoints

All API routes are prefixed with `/api`:

- `GET /api` - Root endpoint, returns a hello world message
- `GET /api/hello` - Hello endpoint, returns a greeting message

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your repository in Vercel: https://vercel.com/new
3. Vercel will automatically detect Next.js and deploy both frontend and API

### Manual Deployment via CLI

```bash
vercel --prod
```

### Environment Variables

If you need environment variables:

1. Create a `.env.local` file for local development
2. Add variables in Vercel Dashboard for production

## How It Works

### Vercel's Python Runtime

- Vercel automatically detects Python files in the `api/` directory
- The `api/index.py` file exports a `app` variable (FastAPI instance)
- FastAPI routes are automatically converted to Vercel Serverless Functions
- Each request spawns a serverless function instance

### Next.js Rewrites

During development, `next.config.ts` rewrites `/api/*` requests to `http://localhost:8000/api/*` (your local FastAPI server).

In production, Vercel automatically routes `/api/*` to the Python serverless functions.

### CORS Configuration

The FastAPI app includes CORS middleware to allow requests from any origin. In production, you should restrict this to your actual domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.vercel.app"],
    # ...
)
```

## Troubleshooting

### 404 Errors on API Routes

- Ensure `api/index.py` exists and exports an `app` variable
- Check that routes include the `/api` prefix
- Verify `vercel.json` has the correct rewrites configuration

### CORS Errors

- Check the CORS middleware configuration in `api/index.py`
- Ensure your frontend domain is in the `allow_origins` list

### Build Failures

- Check Python dependencies are listed in `requirements.txt`
- Ensure Node.js dependencies are in `package.json`
- Review Vercel build logs for specific errors

## Project Configuration Files

### vercel.json

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

This ensures API routes are properly handled by Vercel's routing system.

### requirements.txt

Lists Python dependencies. FastAPI is the only required dependency for the backend:

```
fastapi==0.115.0
```

Note: `uvicorn` is not needed as Vercel provides its own ASGI server.

## Additional Resources

- [Vercel Python Runtime Documentation](https://vercel.com/docs/functions/runtimes/python)
- [FastAPI on Vercel Guide](https://vercel.com/docs/frameworks/backend/fastapi)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## License

MIT
