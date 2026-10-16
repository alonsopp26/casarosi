import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function PlanificadorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  
  // Extraemos si hay un error en la URL
  const resolvedParams = await searchParams;
  const errorMessage = resolvedParams?.error;

  const supabase = await createClient()

  // Verificación de seguridad
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Obtener las recetas disponibles
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, servings')
    .order('title')

  // Obtener el plan semanal
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select(`
      id,
      day_of_week,
      meal_type,
      custom_servings,
      recipes ( title )
    `)
    .eq('user_id', user.id)

 // Server Action: Guardar plan
  async function addMeal(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) return

    const day = formData.get('day_of_week') as string;
    const mealType = formData.get('meal_type') as string;
    const recipeId = formData.get('recipe_id') as string;
    const servingsStr = formData.get('custom_servings') as string;

    // Verificamos si ya está ocupado ese lugar
    const { data: comidaExistente } = await supabaseServer
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('day_of_week', day)
      .eq('meal_type', mealType)
      .maybeSingle();

    if (comidaExistente) {
      redirect(`/planificador?error=ocupada`);
    }

    const customServings = servingsStr && servingsStr.trim() !== '' ? parseInt(servingsStr, 10) : null;

    // Intentamos guardar
    const { error: insertError } = await supabaseServer.from('meal_plans').insert({
      user_id: user.id,
      recipe_id: recipeId,
      day_of_week: day,
      meal_type: mealType,
      custom_servings: customServings,
    });

    if (insertError) {
      console.error("❌ ERROR AL GUARDAR EN EL PLANIFICADOR:", insertError);
      return;
    }
    
    revalidatePath('/planificador')
    redirect('/planificador')
  }

  // Server Action: Eliminar plan
  async function deleteMeal(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const id = formData.get('plan_id') as string
    
    if (!id) return

    await supabaseServer.from('meal_plans').delete().eq('id', id)
    
    revalidatePath('/planificador')
    redirect('/planificador')
  }

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const tipos = ['Desayuno', 'Comida', 'Cena']

  const diasConComidas = dias.filter(dia => 
    mealPlans?.some(plan => plan.day_of_week === dia)
  )

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white transition-colors">Planificador Semanal</h1>
        
        {/* FORMULARIO */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-stone-800 mb-2 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-stone-100">Agregar comida al menú</h2>
          
          <form action={addMeal} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-neutral-700 dark:text-stone-300 mb-1">Día</label>
              <select name="day_of_week" className="w-full px-4 py-2 border border-neutral-300 dark:border-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-800 dark:text-white transition-colors">
                {dias.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-neutral-700 dark:text-stone-300 mb-1">Comida</label>
              <select name="meal_type" className="w-full px-4 py-2 border border-neutral-300 dark:border-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-800 dark:text-white transition-colors">
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full md:w-auto md:flex-grow-[2]">
              <label className="block text-sm font-medium text-neutral-700 dark:text-stone-300 mb-1">Receta</label>
              <select name="recipe_id" className="w-full px-4 py-2 border border-neutral-300 dark:border-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-800 dark:text-white transition-colors">
                {recipes?.map(r => <option key={r.id} value={r.id}>{r.title} (Rinde: {r.servings || 4})</option>)}
              </select>
            </div>
            <div className="flex-1 w-full md:w-32">
              <label className="block text-sm font-medium text-neutral-700 dark:text-stone-300 mb-1" title="Déjalo en blanco para usar las porciones de la receta">¿Porciones?</label>
              <input 
                type="number" 
                name="custom_servings" 
                placeholder="Opcional" 
                min="1"
                className="w-full px-4 py-2 border border-neutral-300 dark:border-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-800 dark:text-white transition-colors" 
              />
            </div>
            <button type="submit" className="bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors w-full md:w-auto shadow-sm cursor-pointer h-[42px]">
              Guardar
            </button>
          </form>
        </div>

        {/* MENSAJE DE ERROR */}
        <div className="h-6 mb-4 px-2">
          {errorMessage === 'ocupada' && (
            <span className="text-red-500 dark:text-red-400 text-sm font-bold tracking-wide transition-colors">
               Ocupada, borra la anterior
            </span>
          )}
        </div>

        {/* Cuadrícula de la semana o Mensaje de Vacío */}
        {diasConComidas.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-10 rounded-xl border border-neutral-200 dark:border-stone-800 text-center shadow-sm mt-4 transition-colors">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-stone-100 mb-2">Tu semana está vacía</h3>
            <p className="text-neutral-500 dark:text-stone-400">Usa el formulario de arriba para empezar a planear tus desayunos, comidas y cenas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diasConComidas.map(dia => (
              <div key={dia} className="bg-white dark:bg-stone-900 rounded-xl border border-neutral-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center transition-colors">
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-400">{dia}</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  {tipos.map(tipo => {
                    const plan = mealPlans?.find(p => p.day_of_week === dia && p.meal_type === tipo)
                    const recipeData = plan?.recipes as any
                    const tituloReceta = recipeData ? (Array.isArray(recipeData) ? recipeData[0]?.title : recipeData?.title) : null

                    return (
                      <div key={tipo}>
                        <div className="flex justify-between items-end mb-1">
                          <p className="text-xs font-semibold text-neutral-500 dark:text-stone-400 uppercase tracking-wider">{tipo}</p>
                          
                          {/* El comentario ya está afuera, el error desaparece */}
                          {tituloReceta && plan?.custom_servings && (
                             <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold transition-colors">
                               x{plan.custom_servings} p.
                             </span>
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 min-h-[3.5rem] flex items-center border text-sm transition-colors ${tituloReceta ? 'bg-white dark:bg-stone-800 border-emerald-200 dark:border-emerald-700/50 shadow-sm' : 'bg-neutral-50 dark:bg-stone-800/50 border-neutral-100 dark:border-stone-800'}`}>
                          {tituloReceta ? (
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="font-medium text-neutral-900 dark:text-stone-100 line-clamp-2 leading-tight" title={tituloReceta}>{tituloReceta}</span>
                              <form action={deleteMeal}>
                                <input type="hidden" name="plan_id" value={plan?.id} />
                                <button type="submit" className="text-red-400 dark:text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 font-bold w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer shrink-0" title="Quitar del menú">
                                  ✕
                                </button>
                              </form>
                            </div>
                          ) : (
                            <span className="text-neutral-400 dark:text-stone-500 italic text-xs">Sin asignar</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}