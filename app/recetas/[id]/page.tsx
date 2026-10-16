import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        quantity,
        group_name,
        is_optional,
        units ( abbreviation, name ),
        ingredients ( name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !recipe) {
    console.error("Error cargando receta:", error)
    notFound()
  }

  const ingredientesAgrupados = recipe.recipe_ingredients?.reduce((acc: any, ing: any) => {
    const grupo = ing.group_name || 'Principal';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(ing);
    return acc;
  }, {});

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <Link href="/recetas" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium inline-flex items-center gap-2 mb-6 transition-colors">
          ← Volver al catálogo
        </Link>

        <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-amber-200/60 dark:border-stone-800 transition-colors">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-64 md:h-80 object-cover" />
          ) : (
            <div className="w-full h-64 md:h-80 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-6xl">
              🍳
            </div>
          )}

          <div className="p-6 md:p-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white leading-tight">{recipe.title}</h1>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-sm font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 rounded-full whitespace-nowrap">
                  ⏱️ {recipe.prep_time_minutes} min
                </div>
                <div className="flex items-center text-sm font-medium text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-4 py-2 rounded-full whitespace-nowrap">
                  🍽️ {recipe.servings || 4} porciones
                </div>
              </div>
            </div>

            <p className="text-lg text-stone-600 dark:text-stone-300 mb-10 pb-10 border-b border-stone-100 dark:border-stone-800">
              {recipe.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* 🛒 SECCIÓN DE INGREDIENTES */}
              <div className="md:col-span-1">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                  🛒 Ingredientes
                </h2>
                <div className="bg-[#fbf8f3] dark:bg-stone-800/60 p-6 rounded-xl border border-amber-200/50 dark:border-stone-800">
                  {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(ingredientesAgrupados).map(([grupo, items]: [string, any]) => (
                        <div key={grupo}>
                          {grupo !== 'Principal' && (
                            <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3 border-b border-amber-200 dark:border-stone-700 pb-1">
                              {grupo}
                            </h3>
                          )}
                          <ul className="space-y-3">
                            {items.map((item: any, idx: number) => {
                              const esAlGusto = item.quantity === null;
                              
                              return (
                                <li key={idx} className="flex items-start gap-3 text-stone-700 dark:text-stone-200">
                                  <span className={`font-bold px-2 py-0.5 rounded text-sm min-w-[3.5rem] text-center shrink-0 ${
                                    esAlGusto 
                                      ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' 
                                      : 'bg-emerald-100/60 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  }`}>
                                    {esAlGusto ? 'Al gusto' : `${item.quantity} ${item.units?.abbreviation}`}
                                  </span>
                                  <span className="pt-0.5 leading-tight">
                                    {item.ingredients?.name}
                                    {item.is_optional && (
                                      <span className="text-xs text-stone-400 dark:text-stone-500 italic ml-1 block sm:inline">(Opcional)</span>
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 dark:text-stone-400 text-sm italic">No se agregaron ingredientes a esta receta.</p>
                  )}
                </div>
              </div>

              {/* 👨‍🍳 SECCIÓN DE INSTRUCCIONES */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                  👨‍🍳 Instrucciones
                </h2>
                <div className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                  {recipe.instructions || 'No se agregaron instrucciones.'}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}