'use client'

import { createClient } from '@/utils/supabase/client'

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirige al callback que acabamos de crear
        redirectTo: `${location.origin}/auth/callback` 
      }
    })
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-neutral-900 text-white font-medium px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
    >
      Continuar con Google
    </button>
  )
}