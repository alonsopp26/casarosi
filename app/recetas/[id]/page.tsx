import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Buscamos la receta específica usando el ID de la URL
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound() // Muestra la página 404 si la receta no existe
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/recetas" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 mb-6 transition-colors">
        ← Volver al catálogo
      </Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-80 object-cover" />
        ) : (
          <div className="w-full h-80 bg-neutral-100 flex items-center justify-center text-6xl">
            🍳
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{recipe.title}</h1>
            <div className="flex items-center text-sm font-medium text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full whitespace-nowrap">
              ⏱️ {recipe.prep_time_minutes} min
            </div>
          </div>

          <p className="text-lg text-neutral-600 mb-10 pb-10 border-b border-neutral-100">
            {recipe.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                🛒 Ingredientes
              </h2>
              {/* whitespace-pre-wrap permite que los saltos de línea del textarea se vean en pantalla */}
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                {recipe.ingredients || 'No se agregaron ingredientes.'}
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                👨‍🍳 Instrucciones
              </h2>
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {recipe.instructions || 'No se agregaron instrucciones.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}