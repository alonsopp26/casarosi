import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Consulta el estado de autenticación o una prueba simple
  const { data, error } = await supabase.auth.getSession()

  return (
    <main className="min-h-screen p-8 bg-neutral-50 text-neutral-900">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-bold mb-2">🍳 La Casa de Rosi</h1>
        <p className="text-neutral-600 mb-4">Conexión con Supabase establecida.</p>
        
        <div className="bg-neutral-100 p-4 rounded-lg font-mono text-xs">
          {error ? (
            <p className="text-red-500">Error: {error.message}</p>
          ) : (
            <p className="text-emerald-600">✓ Conexión exitosa a PostgreSQL / Supabase</p>
          )}
        </div>
      </div>
    </main>
  )
}