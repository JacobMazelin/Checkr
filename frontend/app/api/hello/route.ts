import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const base = process.env.PYTHON_API_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${base}/api/hello`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend error: ${res.status}` },
        { status: 502 }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to reach backend' },
      { status: 500 }
    )
  }
}
