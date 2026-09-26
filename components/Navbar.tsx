import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo y enlace al Inicio */}
          <Link href="/" className="text-2xl font-bold text-orange-600">
            🍳 La Casa de Rosi
          </Link>
          
          {/* Enlaces de navegación */}
          <div className="hidden md:flex space-x-6">
            <Link href="/recetas" className="text-gray-600 hover:text-orange-500 font-medium">
              Recetas
            </Link>
            <Link href="/planificador" className="text-gray-600 hover:text-orange-500 font-medium">
              Planificador
            </Link>
            <Link href="/lista" className="text-gray-600 hover:text-orange-500 font-medium">
              Lista
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-orange-500 font-medium">
              Admin
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}