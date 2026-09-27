import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function RecetasPage() {
  const supabase = await createClient()
  
  // Descargamos las recetas incluyendo su CATEGORÍA y sus ETIQUETAS
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories ( name ),
      recipe_tags (
        tags ( name )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando recetas:', error)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900">Catálogo de Recetas</h1>
      
      {!recipes || recipes.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center">
          <p className="text-neutral-500">Aún no hay recetas publicadas. ¡Sé el primero en agregar una desde el Panel Admin!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link href={`/recetas/${recipe.id}`} key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-all group cursor-pointer flex flex-col h-full">
              
              {/* IMAGEN */}
              {recipe.image_url ? (
                <div className="w-full h-48 overflow-hidden">
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-full h-48 bg-neutral-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                  🍳
                </div>
              )}
              
              {/* CONTENIDO DE LA TARJETA */}
              <div className="p-6 flex flex-col flex-grow bg-white">
                
                {/* Categoría (Si tiene una asignada) */}
                {recipe.categories && (
                  <span className="text-xs font-bold text-orange-500 mb-2 block uppercase tracking-wider">
                    {recipe.categories.name}
                  </span>
                )}
                
                <h2 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {recipe.title}
                </h2>
                
                <p className="text-neutral-500 text-sm line-clamp-2 mb-4 flex-grow">
                  {recipe.description || "Sin descripción disponible."}
                </p>
                
                {/* PIE DE TARJETA: Tiempo y Etiquetas */}
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-neutral-100">
                  
                  {/* Tiempo */}
                  <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    ⏱️ {recipe.prep_time_minutes} min
                  </span>
                  
                  {/* Etiquetas (Tags) */}
                  {recipe.recipe_tags?.map((rt: any, index: number) => (
                    rt.tags && (
                      <span key={index} className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                        #{rt.tags.name}
                      </span>
                    )
                  ))}
                  
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}