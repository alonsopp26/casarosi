import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';
import { redirect } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Íconos                                                             */
/* ------------------------------------------------------------------ */
const Icono = ({ children, className = 'h-6 w-6' }: { children: React.ReactNode; className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const LogoRosi = () => (
  <svg className="h-12 w-12 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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

const redes = [
  {
    nombre: 'Facebook',
    href: '#',
    icono: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />,
  },
  {
    nombre: 'Instagram',
    href: '#',
    icono: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <path d="M16 11.4A4 4 0 1112.6 8 4 4 0 0116 11.4z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    nombre: 'X',
    href: '#',
    icono: <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" />,
  },
  {
    nombre: 'YouTube',
    href: '#',
    icono: (
      <>
        <path d="M22.5 6.4a2.8 2.8 0 00-1.9-2C18.9 4 12 4 12 4s-6.900 0-8.600.4a2.800 2.800 0 00-1.900 2A29 29 0 001 11.700a29 29 0 00.5 5.300A2.800 2.800 0 003.400 19c1.700.5 8.600.5 8.600.5s6.900 0 8.600-.5a2.800 2.800 0 001.900-2 29 29 0 00.5-5.300 29 29 0 00-.5-5.300z" />
        <path d="M9.750 15l5.750-3.250L9.750 8.500V15z" />
      </>
    ),
  },
  {
    nombre: 'LinkedIn',
    href: '#',
    icono: (
      <>
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    nombre: 'TikTok',
    href: '#',
    icono: <path d="M14 3v11.500a3.500 3.500 0 11-3.500-3.500M14 3c.3 2.400 1.900 4.200 4.500 4.500" />,
  },
  {
    nombre: 'Snapchat',
    href: '#',
    icono: (
      <path d="M12 3c-3 0-4.500 2.200-4.500 5v2c-.8.3-2 .5-2.500.7.5 1 1.700 1.100 2.500 1.200-.5 1.300-1.500 2.300-3 2.800 1 .8 2.500.6 3.300 1 .5.8 1.200 1.300 4.200 1.300s3.700-.5 4.200-1.300c.8-.4 2.300-.2 3.300-1-1.500-.5-2.500-1.500-3-2.800.8-.1 2-.2 2.500-1.200-.5-.2-1.700-.4-2.500-.7V8c0-2.800-1.500-5-4.500-5z" />
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Estilos reutilizables                                              */
/* ------------------------------------------------------------------ */
const titulo = 'mb-5 text-xl font-semibold text-stone-800 dark:text-stone-200';
const enlace = 'text-base text-stone-500 dark:text-stone-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400';
const filaContacto = 'flex items-start gap-3 text-base text-stone-500 dark:text-stone-400';

export default async function Footer() {
  const anioActual = new Date().getFullYear();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function cerrarSesion() {
    'use server';
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect('/');
  }

  return (
    <footer className="mt-auto border-t border-amber-100 dark:border-stone-800 bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* MARCA */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <LogoRosi />
              <span className="text-2xl font-extrabold tracking-tight text-[#ff5a4d]">La Casa de Rosi</span>
            </Link>
            <p className="mt-5 max-w-xs text-base leading-relaxed text-stone-500 dark:text-stone-400">
              Descubre, aprende y comparte el arte de la cocina con nuestra comunidad gastronómica.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {redes.map((red) => (
                <a
                  key={red.nombre}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.nombre}
                  className="text-orange-500 dark:text-orange-400 transition-colors hover:text-orange-700 dark:hover:text-orange-300"
                >
                  <Icono>{red.icono}</Icono>
                </a>
              ))}
            </div>
          </div>

          {/* EXPLORAR */}
          <div>
            <h3 className={titulo}>Explorar</h3>
            <ul className="space-y-3">
              <li><Link href="/recetas" className={enlace}>Recetas</Link></li>
              {user && (
                <>
                  <li><Link href="/planificador" className={enlace}>Planificador</Link></li>
                  <li><Link href="/lista" className={enlace}>Lista del súper</Link></li>
                </>
              )}
              <li><Link href="/cursos" className={enlace}>Cursos</Link></li>
              <li><Link href="/productos" className={enlace}>Productos</Link></li>
              <li><Link href="/blog" className={enlace}>Blog</Link></li>
            </ul>
          </div>

          {/* INFORMACIÓN */}
          <div>
            <h3 className={titulo}>Información</h3>
            <ul className="space-y-3">
              <li><Link href="/nosotros" className={enlace}>Nosotros</Link></li>
              <li><Link href="/contacto" className={enlace}>Contacto</Link></li>
              <li><Link href="/afiliados" className={enlace}>Programa de Afiliados</Link></li>
              <li><Link href="/terminos" className={enlace}>Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className={enlace}>Política de Privacidad</Link></li>
            </ul>
          </div>

          {/* CONTACTO Y CUENTA */}
          <div>
            <h3 className={titulo}>Contacto</h3>
            <ul className="space-y-3">
              <li className={filaContacto}>
                <Icono className="mt-0.5 h-6 w-6 shrink-0 text-orange-500 dark:text-orange-400">
                  <path d="M21.750 6.750v10.500a2.250 2.250 0 01-2.250 2.250h-15a2.250 2.250 0 01-2.250-2.250V6.750m19.500 0A2.250 2.250 0 0019.500 4.500h-15a2.250 2.250 0 00-2.250 2.250m19.500 0v.243a2.250 2.250 0 01-1.070 1.916l-7.500 4.615a2.250 2.250 0 01-2.360 0L3.320 8.910a2.250 2.250 0 01-1.070-1.916V6.750" />
                </Icono>
                <a href="mailto:lacasaderosi@gmail.com" className="transition-colors hover:text-orange-600 dark:hover:text-orange-400">
                  lacasaderosi@gmail.com
                </a>
              </li>
              <li className={filaContacto}>
                <Icono className="mt-0.5 h-6 w-6 shrink-0 text-orange-500 dark:text-orange-400">
                  <path d="M2.250 6.750c0 8.284 6.716 15 15 15h2.250a2.250 2.250 0 002.250-2.250v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.210.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.380-1.210l1.293-.970c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.500A2.250 2.250 0 002.250 4.500v2.250z" />
                </Icono>
                <a href="tel:+34123456789" className="transition-colors hover:text-orange-600 dark:hover:text-orange-400">
                  +34 123 456 789
                </a>
              </li>
              <li className={filaContacto}>
                <Icono className="mt-0.5 h-6 w-6 shrink-0 text-orange-500 dark:text-orange-400">
                  <path d="M15 10.500a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M19.500 10.500c0 7.142-7.500 11.250-7.500 11.250S4.500 17.642 4.500 10.500a7.500 7.500 0 1115 0z" />
                </Icono>
                <span>Calle Gastronomía 123, Madrid, España</span>
              </li>
            </ul>

            {/* 👇 SECCIÓN CON ETIQUETA Y MUÑEQUITO DESPLEGABLE */}
            <div className="mt-5 border-t border-amber-100 dark:border-stone-800 pt-5">
              {/* Subtítulo identificador arriba */}
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Cuenta de Google
              </p>

              {user ? (
                <details className="relative inline-block group">
                  <summary
                    aria-label="Cuenta de usuario"
                    className="list-none [&::-webkit-details-marker]:hidden flex cursor-pointer items-center gap-3 rounded-full bg-orange-500/10 dark:bg-orange-500/20 pr-4 text-orange-600 dark:text-orange-400 ring-2 ring-transparent transition-all hover:bg-orange-500/20 dark:hover:bg-orange-500/30 group-open:ring-orange-300 dark:group-open:ring-orange-700"
                  >
                    {/* El círculo del muñequito */}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/20">
                      <Icono className="h-6 w-6">
                        <path d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
                      </Icono>
                    </span>
                    <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                      Mi cuenta
                    </span>
                    {/* Capa invisible para cerrar al hacer clic afuera */}
                    <span aria-hidden="true" className="fixed inset-0 z-40 hidden cursor-default group-open:block"></span>
                  </summary>

                  {/* Ventanita flotante que se abre hacia arriba */}
                  <div className="absolute left-0 bottom-full mb-3 z-50 w-64 rounded-2xl bg-white dark:bg-stone-900 p-4 shadow-xl shadow-stone-400/30 dark:shadow-black/50 ring-1 ring-stone-200 dark:ring-stone-700">
                    <div className="mb-2 flex items-center gap-2">
                      
                      <p className="text-xs font-semibold text-stone-400">Sesión iniciada con Google</p>
                    </div>
                    <p className="mb-4 break-all text-sm font-medium text-stone-800 dark:text-stone-100">{user.email}</p>
                    <form action={cerrarSesion}>
                      <button
                        type="submit"
                        className="w-full cursor-pointer rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 transition-colors hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500 hover:text-white active:bg-red-600"
                      >
                        Cerrar sesión
                      </button>
                    </form>
                  </div>
                </details>
              ) : (
                <div className="flex items-center">
                  <LoginButton />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* DERECHOS */}
        <div className="mt-12 border-t border-amber-100 dark:border-stone-800 pt-8 text-center">
          <p className="text-base text-stone-500 dark:text-stone-400">
            &copy; {anioActual} <span className="text-[#ff5a4d]">La Casa de Rosi</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}