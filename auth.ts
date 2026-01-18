import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseServer } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.freebusy"
        }
      }
    }) // add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        console.log('🔍 OAuth Account Data:', JSON.stringify({
          provider: account.provider,
          type: account.type,
          has_access_token: !!account.access_token,
          has_id_token: !!account.id_token,
          has_refresh_token: !!account.refresh_token,
          access_token_preview: account.access_token ? account.access_token.substring(0, 30) + '...' : 'MISSING',
          id_token_preview: account.id_token ? account.id_token.substring(0, 30) + '...' : 'MISSING',
          expires_at: account.expires_at,
          scope: account.scope,
        }, null, 2));
        
        // CRITICAL: Store access_token ONLY (never id_token)
        // ID tokens cannot make API calls to Google Calendar
        if (!account.access_token) {
          console.error('❌ NO ACCESS TOKEN RECEIVED FROM GOOGLE!');
          console.error('This means the OAuth flow is not configured correctly.');
        }
        
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        
        // ONLY use access_token for oauthCode - NEVER fall back to id_token
        token.oauthCode = account.access_token || null
        
        console.log('💾 Storing in session:', {
          has_accessToken: !!token.accessToken,
          has_refreshToken: !!token.refreshToken,
          has_oauthCode: !!token.oauthCode,
          oauthCode_preview: typeof token.oauthCode === 'string' ? token.oauthCode.substring(0, 30) + '...' : 'NULL'
        });
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.oauthCode = token.oauthCode as string
      
      console.log('📤 Session created with:', {
        has_accessToken: !!session.accessToken,
        has_oauthCode: !!session.oauthCode,
        oauthCode_preview: session.oauthCode ? session.oauthCode.substring(0, 30) + '...' : 'MISSING'
      });
      
      return session
    },
    async signIn({ account, profile }) {
      // Get phone number from URL parameter stored in session
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const phoneNumber = params.get('num')
        if (!phoneNumber) {
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/',
  }
})
