import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';
import { redirect } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

/* ------------------------------------------------------------------ */
/*  Íconos (SVG inline, sin librerías extra)                           */
/* ------------------------------------------------------------------ */
const Icono = ({ d, className = 'h-6 w-6' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const D = {
  buscar: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  corazon:
    'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  carrito:
    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  usuario: 'M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0',
  flecha: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
};

const LogoRosi = () => (
  <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="22" stroke="#f97316" strokeWidth="1.6" />
    <circle cx="24" cy="24" r="17" stroke="#f97316" strokeWidth="0.8" strokeDasharray="2 3" />
    <path
      d="M20.5 12v7a3.5 3.5 0 007 0v-7M24 12v24M24 22v14"
      stroke="#f97316"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Desplegable({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <details className="relative group">
      <summary className="list-none [&::-webkit-details-marker]:hidden flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[17px] font-medium text-stone-800 dark:text-stone-200 transition-colors hover:text-orange-600 dark:hover:text-orange-500 group-open:text-orange-600 dark:group-open:text-orange-500">
        {etiqueta}
        <Icono d={D.flecha} className="h-4 w-4 text-teal-500 transition-transform group-open:rotate-180 group-open:text-orange-500" />
        <span aria-hidden="true" className="fixed inset-0 hidden cursor-default group-open:block"></span>
      </summary>
      <div className="absolute left-0 top-full mt-3 min-w-56 rounded-2xl bg-white/95 dark:bg-stone-900/95 p-2 shadow-xl shadow-stone-400/30 dark:shadow-black/50 ring-1 ring-stone-200 dark:ring-stone-700 backdrop-blur-lg">
        {children}
      </div>
    </details>
  );
}

const itemMenu =
  'block rounded-xl px-4 py-2.5 text-[15px] font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400';

/* ------------------------------------------------------------------ */
/*  Navbar (Componente de Servidor ASYNC)                              */
/* ------------------------------------------------------------------ */
export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let enCarrito = 0;
  let enFavoritos = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';

    const { count } = await supabase
      .from('shopping_list_items')
      .select('id, shopping_lists!inner(status)', { count: 'exact', head: true })
      .eq('shopping_lists.status', 'active')
      .eq('is_checked', false);
    enCarrito = count ?? 0;

    // Contamos cuántas recetas favoritas tiene el usuario
    const { count: favCount } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    enFavoritos = favCount ?? 0;
  }

  async function cerrarSesion() {
    'use server';
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect('/');
  }

  const linkDesktop =
    'rounded-full px-3 py-2 text-[17px] font-medium text-stone-800 dark:text-stone-200 transition-colors hover:text-orange-600 dark:hover:text-orange-500';
  const linkMovil =
    'rounded-xl px-4 py-3 text-base font-medium text-stone-800 dark:text-stone-200 transition-colors hover:bg-orange-50 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400 active:bg-orange-100 dark:active:bg-stone-700';
  const botonIcono =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-orange-500 dark:text-orange-400 transition-colors hover:bg-orange-500/10 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-300';

  const capaCerrar = (
    <span aria-hidden="true" className="fixed inset-0 hidden cursor-default group-open:block"></span>
  );

  // Botón del Corazón (Favoritos)
  const Favoritos = (
    <Link
      href="/recetas?fav=true"
      aria-label={`Recetas favoritas${enFavoritos ? `, ${enFavoritos} guardadas` : ''}`}
      title="Mis recetas favoritas"
      className={botonIcono}
    >
      <Icono d={D.corazon} />
      {enFavoritos > 0 && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3d77] px-1 text-[11px] font-bold leading-none text-white">
          {enFavoritos > 99 ? '99+' : enFavoritos}
        </span>
      )}
    </Link>
  );

  // Botón del Carrito
  const Carrito = (
    <Link
      href="/lista"
      aria-label={`Lista de compras${enCarrito ? `, ${enCarrito} artículos` : ''}`}
      title="Lista de compras"
      className={botonIcono}
    >
      <Icono d={D.carrito} />
      {enCarrito > 0 && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-bold leading-none text-white">
          {enCarrito > 99 ? '99+' : enCarrito}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 dark:border-stone-800/80 shadow-sm transition-colors duration-300">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/60 dark:bg-stone-950/80 backdrop-blur-xl"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">

          <Link href="/" className="flex items-center gap-3">
            <LogoRosi />
            <span className="text-xl font-extrabold tracking-tight text-[#ff5a4d] transition-colors hover:text-orange-500 sm:text-[28px]">
              La Casa de Rosi
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Desplegable etiqueta="Recetas">
              <Link href="/recetas" className={itemMenu}>Catálogo</Link>
              {user && (
                <>
                  <Link href="/recetas?fav=true" className={itemMenu}>Mis favoritos</Link>
                  <Link href="/planificador" className={itemMenu}>Planificador</Link>
                  <Link href="/lista" className={itemMenu}>Lista de compras</Link>
                </>
              )}
            </Desplegable>

            <Link href="/cursos" className={linkDesktop}>Cursos</Link>

            <Desplegable etiqueta="Productos">
              <Link href="/productos" className={itemMenu}>Todos los productos</Link>
            </Desplegable>

            <Link href="/blog" className={linkDesktop}>Blog</Link>
            <Link href="/nosotros" className={linkDesktop}>Nosotros</Link>
            <Link href="/contacto" className={linkDesktop}>Contacto</Link>
          </div>

          {/* ESCRITORIO: íconos de la derecha */}
          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle className={botonIcono} />
            {Favoritos}
            {Carrito}

            {isAdmin && (
              <Link href="/admin" className="ml-2 rounded-full bg-orange-500/10 dark:bg-orange-500/20 px-4 py-2 text-sm font-bold text-orange-700 dark:text-orange-400 transition-colors hover:bg-orange-500/20 dark:hover:bg-orange-500/30">
                Admin
              </Link>
            )}

            <div className="mx-2 h-6 w-px bg-stone-300/80 dark:bg-stone-700/80"></div>

            {user ? (
              <details className="relative group">
                <summary
                  aria-label="Cuenta de usuario"
                  className="list-none [&::-webkit-details-marker]:hidden flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 ring-2 ring-transparent transition-all hover:bg-orange-500/20 dark:hover:bg-orange-500/30 group-open:ring-orange-300 dark:group-open:ring-orange-700"
                >
                  <Icono d={D.usuario} />
                  {capaCerrar}
                </summary>
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl bg-white dark:bg-stone-900 p-4 shadow-xl shadow-stone-400/30 dark:shadow-black/50 ring-1 ring-stone-200 dark:ring-stone-700">
                  <p className="mb-1 text-xs text-stone-400">Sesión iniciada</p>
                  <p className="mb-4 break-all text-sm font-medium text-stone-800 dark:text-stone-100">{user.email}</p>
                  <form action={cerrarSesion}>
                    <button type="submit" className="w-full rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 transition-colors hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500 hover:text-white active:bg-red-600">
                      Salir
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* CELULAR / TABLET */}
          <div className="flex items-center gap-1 lg:hidden">
            <Link href="/recetas" aria-label="Buscar recetas" className={botonIcono}>
              <Icono d={D.buscar} />
            </Link>
            
            <ThemeToggle className={botonIcono} />
            {Favoritos}
            {Carrito}

            <details className="group">
              <summary
                aria-label="Menú"
                className="list-none [&::-webkit-details-marker]:hidden flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-stone-800 dark:text-stone-200 transition-colors hover:bg-white/60 dark:hover:bg-stone-800 active:bg-white/80 dark:active:bg-stone-700"
              >
                <svg className="h-6 w-6 group-open:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <svg className="hidden h-6 w-6 group-open:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
                {capaCerrar}
              </summary>

              <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-white/40 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col gap-1 px-4 py-4">

                  <details className="group/sub">
                    <summary className={`${linkMovil} list-none [&::-webkit-details-marker]:hidden flex cursor-pointer items-center justify-between`}>
                      Recetas
                      <Icono d={D.flecha} className="h-4 w-4 text-teal-500 transition-transform group-open/sub:rotate-180" />
                    </summary>
                    <div className="ml-3 flex flex-col border-l-2 border-orange-200 dark:border-orange-900/50 pl-2">
                      <Link href="/recetas" className={linkMovil}>Catálogo</Link>
                      {user && (
                        <>
                          <Link href="/recetas?fav=true" className={linkMovil}>Mis favoritos</Link>
                          <Link href="/planificador" className={linkMovil}>Planificador</Link>
                          <Link href="/lista" className={linkMovil}>Lista de compras</Link>
                        </>
                      )}
                    </div>
                  </details>

                  <Link href="/cursos" className={linkMovil}>Cursos</Link>

                  <details className="group/sub">
                    <summary className={`${linkMovil} list-none [&::-webkit-details-marker]:hidden flex cursor-pointer items-center justify-between`}>
                      Productos
                      <Icono d={D.flecha} className="h-4 w-4 text-teal-500 transition-transform group-open/sub:rotate-180" />
                    </summary>
                    <div className="ml-3 flex flex-col border-l-2 border-orange-200 dark:border-orange-900/50 pl-2">
                      <Link href="/productos" className={linkMovil}>Todos los productos</Link>
                    </div>
                  </details>

                  <Link href="/blog" className={linkMovil}>Blog</Link>
                  <Link href="/nosotros" className={linkMovil}>Nosotros</Link>
                  <Link href="/contacto" className={linkMovil}>Contacto</Link>

                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 px-4 py-3 text-base font-bold text-orange-700 dark:text-orange-400 transition-colors hover:bg-orange-100 dark:hover:bg-orange-500/20">
                      <span>⚙️</span> Admin
                    </Link>
                  )}

                  <div className="my-2 h-px bg-stone-200 dark:bg-stone-800"></div>

                  {user ? (
                    <div className="flex flex-col gap-3 px-1">
                      <span className="truncate rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-2 text-xs text-stone-500 dark:text-stone-400" title={user.email}>
                        {user.email}
                      </span>
                      <form action={cerrarSesion}>
                        <button type="submit" className="w-full rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-3 text-base font-bold text-red-500 dark:text-red-400 transition-colors hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500 hover:text-white active:bg-red-600">
                          Salir
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex justify-center px-1">
                      <LoginButton />
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>

        </div>
      </div>
    </nav>
  );
}