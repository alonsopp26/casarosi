import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import LoginButton from '@/components/LoginButton'

export default async function Home() {
  const supabase = await createClient()
  
  // Obtenemos al usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()

  // Función de servidor para cerrar sesión
  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
  }

  return (
    <main className="min-h-screen p-8 bg-neutral-50 text-neutral-900">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <h1 className="text-3xl font-bold mb-2">🍳 La Casa de Rosi</h1>
        
        {user ? (
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-emerald-800 font-medium mb-1">¡Conexión exitosa!</p>
            <p className="text-sm text-emerald-600 mb-4">Has iniciado sesión como: <strong>{user.email}</strong></p>
            
            <form action={signOut}>
              <button className="text-sm px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-neutral-600 mb-6">Inicia sesión para comenzar a gestionar tus recetas y planificación.</p>
            <LoginButton />
          </div>
        )}
      </div>
    </main>
  )
}