import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { phone, oauthCode, email } = await req.json()

    if (!phone || !oauthCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert phone to integer (remove any non-digits)
    const phoneInt = parseInt(phone.replace(/\D/g, ''), 10)

    // Insert into Supabase
    const { data, error } = await supabaseServer
      .from('oauth_users') // Replace with your actual table name
      .insert({
        phone: phoneInt,
        oauthcode: oauthCode,
        email: email,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
