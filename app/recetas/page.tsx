import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function RecetasPage() {
  const supabase = await createClient()
  
  // Descargamos las recetas ordenadas por fecha de creación (las más nuevas primero)
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
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
            <Link href={`/recetas/${recipe.id}`} key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-all group cursor-pointer block">
              
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-48 bg-neutral-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                  🍳
                </div>
              )}
              
              <div className="p-6 relative bg-white">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">{recipe.title}</h2>
                <p className="text-neutral-600 line-clamp-2 mb-4">{recipe.description}</p>
                
                <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                  ⏱️ {recipe.prep_time_minutes} min
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}