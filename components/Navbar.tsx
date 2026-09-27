import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';
import { redirect } from 'next/navigation';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Buscamos el rol del usuario (si es que hay uno logueado)
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="text-2xl font-bold text-orange-600">
            🍳 La Casa de Rosi
          </Link>
          
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/recetas" className="text-gray-600 hover:text-orange-500 font-medium">
              Catálogo
            </Link>
            
            {/* Todos los logueados ven esto */}
            {user && (
              <>
                <Link href="/planificador" className="text-gray-600 hover:text-orange-500 font-medium">Planificador</Link>
                <Link href="/lista" className="text-gray-600 hover:text-orange-500 font-medium">Lista</Link>
              </>
            )}

            {/* SOLO LOS ADMINS ven esto */}
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-orange-500 font-bold flex items-center gap-1">
                <span>⚙️</span> Admin
              </Link>
            )}

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 truncate max-w-[120px]" title={user.email}>
                  {user.email}
                </span>
                <form action={async () => {
                  'use server';
                  const supabaseServer = await createClient();
                  await supabaseServer.auth.signOut();
                  redirect('/'); // <-- NUEVA LÍNEA: Te manda al inicio tras cerrar sesión
                }}>
                  <button type="submit" className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                    Salir
                  </button>
                </form>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}