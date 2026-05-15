import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js'
import { readonly, ref } from 'vue'
import { supabase } from '@/lib/supabase'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const loading = ref(false)

let initialized = false
let initializePromise: Promise<void> | null = null
let authSubscription: Subscription | null = null

const logAuthEvent = (event: AuthChangeEvent, session: Session | null) => {
  console.log('AUTH EVENT', event)
  console.log('USER', session?.user?.email ?? null)
  console.log('SESSION', session)

  if (event === 'SIGNED_IN') {
    console.log('[auth] SIGNED_IN')
  }
  if (event === 'SIGNED_OUT') {
    console.log('[auth] SIGNED_OUT')
  }
  if (event === 'TOKEN_REFRESHED') {
    console.log('[auth] TOKEN_REFRESHED')
  }
}

const applySession = (session: Session | null) => {
  currentSession.value = session
  currentUser.value = session?.user ?? null
}

const restoreSession = async () => {
  loading.value = true
  try {
    const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] =
      await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser()
      ])

    if (sessionError) {
      console.warn('[auth] Failed to restore session with getSession()', sessionError)
    }
    if (userError) {
      console.warn('[auth] Failed to restore user with getUser()', userError)
    }

    const restoredSession = sessionData.session
    const restoredUser = userData.user ?? restoredSession?.user ?? null

    currentSession.value = restoredSession
    currentUser.value = restoredUser

    console.log('[auth] Initial restore complete')
    console.log('USER', restoredUser?.email ?? null)
    console.log('SESSION', restoredSession)
  } finally {
    loading.value = false
  }
}

const startAuthListener = () => {
  if (authSubscription) return

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    applySession(session)
    logAuthEvent(event, session)
  })

  authSubscription = data.subscription
}

export const stopAuthListener = () => {
  if (!authSubscription) return
  authSubscription.unsubscribe()
  authSubscription = null
}

export const initAuth = async () => {
  if (initialized) return
  if (initializePromise) {
    await initializePromise
    return
  }

  initializePromise = (async () => {
    await restoreSession()
    startAuthListener()
    initialized = true
  })()

  try {
    await initializePromise
  } finally {
    initializePromise = null
  }
}

export const useAuth = () => {
  void initAuth()

  const signInWithGoogle = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })

      if (error) {
        console.warn('[auth] Google sign in failed', error)
        throw error
      }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('[auth] Sign out failed', error)
        throw error
      }
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(currentUser),
    session: readonly(currentSession),
    loading: readonly(loading),
    signInWithGoogle,
    signOut
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopAuthListener()
    initialized = false
    initializePromise = null
  })
}
