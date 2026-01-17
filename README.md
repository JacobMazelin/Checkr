# Next.js + FastAPI Hello World

A simple full-stack application with a Next.js frontend and FastAPI backend.

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── main.py       # Main FastAPI application
│   └── requirements.txt
├── frontend/         # Next.js frontend
│   ├── app/
│   │   └── page.tsx  # Main page with API integration
│   └── package.json
├── vercel.json       # Vercel deployment configuration
└── .vercelignore     # Files to ignore during deployment
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   The backend will be available at `http://localhost:8000`

## Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Using the Application

1. Start the FastAPI backend (on port 8000)
2. Start the Next.js frontend (on port 3000)
3. Open your browser to `http://localhost:3000`
4. You should see two cards displaying messages from the FastAPI backend

## API Endpoints

- `GET /` - Returns a hello world message
- `GET /api/hello` - Returns a message from the API endpoint

## Deployment to Vercel

The application is configured to deploy the Next.js frontend to Vercel. The backend is ignored during Vercel deployment (configured in `.vercelignore`).

### Deploying the Frontend

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

### Important Notes for Deployment

- The `vercel.json` is configured to build the Next.js app from the `frontend` subdirectory
- The backend directory is ignored during Vercel deployment
- For production, you'll need to deploy the FastAPI backend separately (e.g., on Railway, Render, or AWS)
- Update the API endpoint URLs in `frontend/app/page.tsx` to point to your deployed backend

### Deploying the Backend

For the FastAPI backend, consider these options:
- **Railway**: Easy Python deployment with PostgreSQL support
- **Render**: Free tier available for Python apps
- **AWS Lambda**: Serverless deployment with AWS API Gateway
- **Google Cloud Run**: Container-based serverless deployment

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, Uvicorn
- **Communication**: REST API with CORS enabled

## Troubleshooting

### 404 Error on Vercel

If you encounter a 404 error on Vercel, ensure:
1. The `vercel.json` file is present in the root directory
2. The `frontend/package.json` exists
3. The build and output directories are correctly configured in `vercel.json`

### CORS Issues

If you encounter CORS issues in production:
1. Update the CORS origins in `backend/main.py` to include your Vercel domain
2. Example: `allow_origins=["https://your-app.vercel.app"]`
