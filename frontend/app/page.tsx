export default async function Home() {
  let message: string | null = null
  try {
    const base = process.env.PYTHON_API_URL || 'http://localhost:8000'
    const res = await fetch(`${base}/api/hello`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      message = data?.message ?? null
    }
  } catch (e) {
    message = null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Frontend → Python Hello</h1>
        <p className="mt-6 text-lg text-zinc-700 dark:text-zinc-300">
          {message ? (
            <span>{message}</span>
          ) : (
            <span className="italic">No message. Is the backend running on port 8000?</span>
          )}
        </p>
      </main>
    </div>
  )
}
