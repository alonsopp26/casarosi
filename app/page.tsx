import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import LoginButton from '@/components/LoginButton'; // Importamos tu botón de Google

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Verificamos si hay un usuario con sesión iniciada
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Obtenemos las últimas recetas
  const { data: ultimasRecetas } = await supabase
    .from('recipes')
    .select('id, title, description, prep_time_minutes, image_url')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      
      {/* SECCIÓN HERO (Bienvenida) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-5 sm:mb-6">
            Bienvenido a <span className="text-orange-300 italic">La Casa de Rosi</span> 🍳
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-50/90 max-w-2xl mb-8 sm:mb-10 mx-auto md:mx-0 leading-relaxed">
            Descubre recetas increíbles, planifica tus comidas de la semana y genera tu lista de compras automáticamente. Tu cocina, organizada como nunca antes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <Link 
              href="/recetas" 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-orange-900/30 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/60"
            >
              Explorar Catálogo
            </Link>
            <Link 
              href="/planificador" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold py-3.5 px-8 rounded-full backdrop-blur-md transition-all duration-300 border border-white/30 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Mi Planificador Semanal
            </Link>
          </div>
        </div>
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 md:-mt-24 md:-mr-24 md:w-[28rem] md:h-[28rem] bg-emerald-500 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-16 w-56 h-56 md:-mb-32 md:-ml-20 md:w-80 md:h-80 bg-orange-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      </section>

      {/* SECCIÓN RECETAS RECIENTES */}
      <section className="max-w-7xl mx-auto py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Agregadas Recientemente</h2>
            <div className="w-16 h-1 bg-orange-400 rounded-full mt-3"></div>
            <p className="text-sm sm:text-base text-stone-500 mt-3 sm:mt-4">Las últimas creaciones culinarias de la comunidad.</p>
          </div>
          <Link href="/recetas" className="hidden md:inline-flex items-center gap-1 text-emerald-700 font-bold hover:text-emerald-900 hover:gap-2 transition-all">
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {ultimasRecetas && ultimasRecetas.length > 0 ? (
            ultimasRecetas.map((receta) => (
              <Link href={`/recetas/${receta.id}`} key={receta.id} className="group">
                <div className="bg-white rounded-3xl shadow-sm ring-1 ring-stone-200/70 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/10 md:hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 h-full flex flex-col">
                  
                  {/* Imagen de la receta */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
                    {receta.image_url ? (
                      <img 
                        src={receta.image_url} 
                        alt={receta.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 shadow-md flex items-center gap-1">
                      <span>⏱️</span> {receta.prep_time_minutes} min
                    </div>
                  </div>

                  {/* Información de la receta */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {receta.title}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {receta.description || "Sin descripción disponible."}
                    </p>
                    <span className="text-sm font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                      Ver receta →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 sm:py-16 px-4 text-center text-stone-500 bg-white rounded-3xl border-2 border-dashed border-stone-200">
              <p className="text-5xl mb-4">👨‍🍳</p>
              <p className="text-lg font-medium text-stone-700">Aún no hay recetas publicadas.</p>
              <Link href="/admin" className="text-emerald-600 font-semibold hover:text-emerald-800 hover:underline mt-3 inline-block">
                Sé el primero en agregar una
              </Link>
            </div>
          )}
        </div>

        {/* "Ver todas" para celular (en escritorio va arriba a la derecha) */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/recetas" className="inline-block w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-colors">
            Ver todas las recetas →
          </Link>
        </div>
      </section>

    </div>
  );
}