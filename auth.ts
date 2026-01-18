import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseServer } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar.app.created",
            "https://www.googleapis.com/auth/calendar.freebusy",
          ].join(" ")
        }
      }
    }) // add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        // Use the access token, not the ID token - ID tokens cannot make API calls
        token.oauthCode = account.access_token || account.id_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.oauthCode = token.oauthCode as string
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
