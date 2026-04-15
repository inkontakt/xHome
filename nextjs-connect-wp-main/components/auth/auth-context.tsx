'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to get session'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session)
        setUser(session?.user ?? null)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Sign up failed')
      setError(errorObj)
      throw errorObj
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Sign in failed')
      setError(errorObj)
      throw errorObj
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Sign out failed')
      setError(errorObj)
      throw errorObj
    }
  }

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('OAuth sign in failed')
      setError(errorObj)
      throw errorObj
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, error, signUp, signIn, signOut, signInWithOAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
