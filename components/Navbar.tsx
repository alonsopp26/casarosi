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

  // Acción de cerrar sesión (se usa en escritorio y celular)
  async function cerrarSesion() {
    'use server';
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect('/'); // Te manda al inicio tras cerrar sesión
  }

  const linkDesktop = 'text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-full font-medium transition-colors';
  const linkMovil = 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 px-4 py-3 rounded-xl font-medium text-base transition-colors';

  // Capa transparente que cubre toda la pantalla mientras un menú está abierto.
  // Está DENTRO del <summary>, así que tocarla equivale a tocar el botón: el menú se cierra.
  const capaCerrar = (
    <span aria-hidden="true" className="fixed inset-0 hidden group-open:block cursor-default"></span>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/80 shadow-sm">
      {/* Fondo con efecto vidrio (va aparte para que la capa de cierre pueda cubrir toda la pantalla) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/85 backdrop-blur-lg"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="font-serif text-xl sm:text-2xl font-bold text-orange-600 hover:text-orange-500 transition-colors tracking-tight">
            🍳 La Casa de Rosi
          </Link>
          
          {/* ESCRITORIO */}
          <div className="hidden md:flex space-x-2 items-center">
            <Link href="/recetas" className={linkDesktop}>
              Catálogo
            </Link>
            
            {/* Todos los logueados ven esto */}
            {user && (
              <>
                <Link href="/planificador" className={linkDesktop}>Planificador</Link>
                <Link href="/lista" className={linkDesktop}>Lista</Link>
              </>
            )}

            {/* SOLO LOS ADMINS ven esto */}
            {isAdmin && (
              <Link href="/admin" className="text-black-700  hover:bg-orange-100 px-4 py-2 rounded-full font-bold flex items-center gap-1 transition-colors">
                <span></span> Admin
              </Link>
            )}

            <div className="h-6 w-px bg-stone-200 mx-3"></div>

            {user ? (
              // Muñequito de usuario: al picarle se abre un cuadro con el correo y "Salir"
              <details className="relative group">
                <summary
                  aria-label="Cuenta de usuario"
                  className="list-none [&::-webkit-details-marker]:hidden flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-transparent hover:bg-emerald-200 group-open:ring-emerald-300 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
                  </svg>
                  {capaCerrar}
                </summary>

                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl bg-white p-4 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200">
                  <p className="text-xs text-stone-400 mb-1">Sesión iniciada</p>
                  <p className="text-sm font-medium text-stone-800 break-all mb-4">{user.email}</p>
                  <form action={cerrarSesion}>
                    <button type="submit" className="w-full text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 active:bg-red-600 px-4 py-2.5 rounded-xl border border-red-200 hover:border-red-500 transition-colors">
                      Salir
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* CELULAR / TABLET: menú hamburguesa con <details> (sin archivos extra ni JavaScript) */}
          <details className="md:hidden group">
            <summary
              aria-label="Menú"
              className="list-none [&::-webkit-details-marker]:hidden flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors"
            >
              {/* Ícono hamburguesa (cerrado) */}
              <svg className="h-6 w-6 group-open:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              {/* Ícono X (abierto) */}
              <svg className="h-6 w-6 hidden group-open:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
              {capaCerrar}
            </summary>

            <div className="absolute inset-x-0 top-full border-b border-stone-200 bg-white/95 backdrop-blur-lg shadow-lg">
              <div className="flex flex-col gap-1 px-4 py-4">
                <Link href="/recetas" className={linkMovil}>Catálogo</Link>

                {user && (
                  <>
                    <Link href="/planificador" className={linkMovil}>Planificador</Link>
                    <Link href="/lista" className={linkMovil}>Lista</Link>
                  </>
                )}

                {isAdmin && (
                  <Link href="/admin" className="text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-3 rounded-xl font-bold text-base flex items-center gap-2 transition-colors">
                    <span>⚙️</span> Admin
                  </Link>
                )}

                <div className="h-px bg-stone-200 my-2"></div>

                {user ? (
                  <div className="flex flex-col gap-3 px-1">
                    <span className="text-xs text-stone-500 bg-stone-100 px-3 py-2 rounded-xl truncate" title={user.email}>
                      {user.email}
                    </span>
                    <form action={cerrarSesion}>
                      <button type="submit" className="w-full text-base font-bold text-red-500 hover:text-white hover:bg-red-500 active:bg-red-600 px-4 py-3 rounded-xl border border-red-200 hover:border-red-500 transition-colors">
                        Salir
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="px-1 flex justify-center">
                    <LoginButton />
                  </div>
                )}
              </div>
            </div>
          </details>

        </div>
      </div>
    </nav>
  );
}