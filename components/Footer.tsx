import Link from 'next/link';

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Nombre */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-orange-600 flex items-center gap-2">
              🍳 La Casa de Rosi
            </span>
            <p className="text-sm text-neutral-500 mt-1">
              Organiza tus recetas y compras fácilmente.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="flex gap-6 text-sm font-medium text-neutral-600">
            <Link href="/recetas" className="hover:text-orange-500 transition-colors">
              Catálogo
            </Link>
            <Link href="/planificador" className="hover:text-orange-500 transition-colors">
              Planificador
            </Link>
            <Link href="/lista" className="hover:text-orange-500 transition-colors">
              Lista del Súper
            </Link>
          </div>

        </div>

        {/* Derechos de autor */}
        <div className="mt-8 pt-4 border-t border-neutral-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-neutral-400">
            &copy; {anioActual} La Casa de Rosi. Todos los derechos reservados.
          </p>
          <p className="text-xs text-neutral-400">
            Desarrollado para la gestión del hogar.
          </p>
        </div>
      </div>
    </footer>
  );
}