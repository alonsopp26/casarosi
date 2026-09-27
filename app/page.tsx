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
    <div className="min-h-screen bg-neutral-50">
      
      {/* SECCIÓN HERO (Bienvenida) */}
      <section className="bg-emerald-800 text-white py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Bienvenido a <span className="text-orange-400">La Casa de Rosi</span> 🍳
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mb-10 mx-auto md:mx-0">
            Descubre recetas increíbles, planifica tus comidas de la semana y genera tu lista de compras automáticamente. Tu cocina, organizada como nunca antes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              href="/recetas" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg"
            >
              Explorar Catálogo
            </Link>
            <Link 
              href="/planificador" 
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full backdrop-blur-sm transition-colors border border-white/30"
            >
              Mi Planificador Semanal
            </Link>
          </div>
        </div>
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </section>

      {/* SECCIÓN RECETAS RECIENTES */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Agregadas Recientemente</h2>
            <p className="text-neutral-500 mt-2">Las últimas creaciones culinarias de la comunidad.</p>
          </div>
          <Link href="/recetas" className="hidden md:block text-emerald-600 font-bold hover:text-emerald-800 transition-colors">
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ultimasRecetas && ultimasRecetas.length > 0 ? (
            ultimasRecetas.map((receta) => (
              <Link href={`/recetas/${receta.id}`} key={receta.id} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  
                  {/* Imagen de la receta */}
                  <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                    {receta.image_url ? (
                      <img 
                        src={receta.image_url} 
                        alt={receta.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 shadow-sm flex items-center gap-1">
                      <span>⏱️</span> {receta.prep_time_minutes} min
                    </div>
                  </div>

                  {/* Información de la receta */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {receta.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-4 flex-1">
                      {receta.description || "Sin descripción disponible."}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-neutral-500 bg-white rounded-2xl border border-dashed border-neutral-200">
              <p className="text-4xl mb-4">👨‍🍳</p>
              <p className="text-lg font-medium">Aún no hay recetas publicadas.</p>
              <Link href="/admin" className="text-emerald-600 hover:underline mt-2 inline-block">
                Sé el primero en agregar una
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}