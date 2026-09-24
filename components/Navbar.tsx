import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold flex items-center gap-2 text-neutral-900">
  🍳 <span>La Casa de Rosi</span>
     </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/recetas" className="text-neutral-600 hover:text-neutral-900 transition-colors">
          Recetas
        </Link>
        <Link href="/planificador" className="text-neutral-600 hover:text-neutral-900 transition-colors">
          Planificador
        </Link>
        
        {/* Solo mostramos el enlace de Admin si hay un usuario logueado */}
        {user && (
          <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 transition-colors">
            Panel Admin
          </Link>
        )}
      </div>
    </nav>
  )
}