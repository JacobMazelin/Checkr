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

    // Check if phone already exists
    const { data: existing } = await supabaseServer
      .from('checkrdata')
      .select('*')
      .eq('phone', phoneInt)
      .single()

    if (existing) {
      // If OAuth code is already set, return already exists
      if (existing.oauthcode) {
        return NextResponse.json(
          { success: true, alreadyExists: true },
          { status: 200 }
        )
      }
      
      // Otherwise, update the existing row with the OAuth code
      const { data: updated, error: updateError } = await supabaseServer
        .from('checkrdata')
        .update({ oauthcode: oauthCode })
        .eq('phone', phoneInt)
        .select()

      if (updateError) {
        console.error('Supabase update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update OAuth code' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, alreadyExists: false, data: updated }, { status: 200 })
    }

    // Insert into Supabase
    const { data, error } = await supabaseServer
      .from('checkrdata')
      .insert({
        phone: phoneInt,
        oauthcode: oauthCode,
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, alreadyExists: false, data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

}
