"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");
  const [apiMessage, setApiMessage] = useState<string>("Loading...");

  useEffect(() => {
    // In production (Vercel), this will be relative to the same domain
    // In development, make sure your FastAPI is running on port 8000
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    
    // Fetch from root API endpoint
    fetch(apiBase)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Error fetching root:", error);
        setMessage(`Error: ${error.message}`);
      });

    // Fetch from hello endpoint
    fetch(`${apiBase}/hello`)
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((error) => {
        console.error("Error fetching hello:", error);
        setApiMessage(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          Next.js + FastAPI on Vercel
        </h1>
        
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">
              Root Endpoint (/api)
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">
              Hello Endpoint (/api/hello)
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {apiMessage}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          <p>✅ Frontend: Next.js deployed on Vercel</p>
          <p>✅ Backend: FastAPI serverless functions on Vercel</p>
        </div>
      </main>
    </div>
  );
}
