import Link from 'next/link';

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-emerald-950 text-emerald-100 mt-auto">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-emerald-500"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          {/* Logo / Nombre */}
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif text-xl sm:text-2xl font-bold text-orange-300 flex items-center gap-2">
              🍳 La Casa de Rosi
            </span>
            <p className="text-sm text-emerald-200/70 mt-2">
              Organiza tus recetas y compras fácilmente.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="flex flex-wrap justify-center gap-2 text-sm font-medium">
            <Link href="/recetas" className="px-4 py-2.5 rounded-full text-emerald-100 hover:bg-white/10 active:bg-white/20 hover:text-orange-300 transition-colors">
              Catálogo
            </Link>
            <Link href="/planificador" className="px-4 py-2.5 rounded-full text-emerald-100 hover:bg-white/10 active:bg-white/20 hover:text-orange-300 transition-colors">
              Planificador
            </Link>
            <Link href="/lista" className="px-4 py-2.5 rounded-full text-emerald-100 hover:bg-white/10 active:bg-white/20 hover:text-orange-300 transition-colors">
              Lista del Súper
            </Link>
          </div>

        </div>

        {/* Derechos de autor */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-white/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-emerald-200/60">
            &copy; {anioActual} La Casa de Rosi. Todos los derechos reservados.
          </p>
          <p className="text-xs text-emerald-200/60">
            Desarrollado para la gestión del hogar.
          </p>
        </div>
      </div>
    </footer>
  );
}