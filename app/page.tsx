"use client";

import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Shield, Zap, CheckCircle, LogOut } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('num');

  // Save to Supabase when session is created
  useEffect(() => {
    if (session && phoneNumber) {
      saveToSupabase();
    }
  }, [session]);

  const saveToSupabase = async () => {
    try {
      const response = await fetch('/api/save-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber?.replace(/\D/g, '') || '', // Remove non-digits and no +
          oauthCode: (session as any)?.oauthCode || '',
          email: session?.user?.email,
        }),
      });
      if (!response.ok) {
        console.error('Failed to save to Supabase');
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  // Reject if no phone number in URL
  if (status === "unauthenticated" && !phoneNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              This link is invalid. Please use the correct link with your phone number.
            </p>
            <p className="text-sm text-gray-500">
              Example: yoursite.com?num=16301236433
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Sign up
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Let's get your schedule and email synced with your Google account.
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => signIn("google")}
                className="w-full flex items-center justify-center px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white group"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-gray-700 font-medium group-hover:text-gray-900">
                  Sign in with Google
                </span>
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Secure & Private</span>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-gray-400">
                <Shield className="w-5 h-5" />
                <Zap className="w-5 h-5" />
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-sm text-gray-400">
            Made with ❤️ by Anmol & Jacob.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - show success
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Success! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your Google account has been connected
          </p>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {session.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                />
              )}
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {session.user?.email}
                </p>

              </div>
            </div>
            
            {/* Connected Services */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Calendar</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Profile</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium mx-auto"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
