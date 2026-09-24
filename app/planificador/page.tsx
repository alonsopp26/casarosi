import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function PlanificadorPage() {
  const supabase = await createClient()

  // 1. Verificación de seguridad
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 2. Obtener las recetas disponibles
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title')
    .order('title')

  // 3. Obtener el plan semanal
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select(`
      id,
      day_of_week,
      meal_type,
      recipes ( title )
    `)
    .eq('user_id', user.id)

  // 4. Server Action: Guardar plan
  async function addMeal(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) return

    await supabaseServer.from('meal_plans').insert({
      user_id: user.id,
      recipe_id: formData.get('recipe_id') as string,
      day_of_week: formData.get('day_of_week') as string,
      meal_type: formData.get('meal_type') as string,
    })
    
    revalidatePath('/planificador')
  }

  // 5. Server Action: Eliminar plan
  async function deleteMeal(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const id = formData.get('plan_id') as string
    
    if (!id) return

    await supabaseServer.from('meal_plans').delete().eq('id', id)
    revalidatePath('/planificador')
  }

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const tipos = ['Desayuno', 'Comida', 'Cena']

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900">Planificador Semanal</h1>
      
      {/* Formulario para asignar recetas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-neutral-800">Agregar comida al menú</h2>
        <form action={addMeal} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Día</label>
            <select name="day_of_week" className="w-full px-4 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              {dias.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Comida</label>
            <select name="meal_type" className="w-full px-4 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Receta</label>
            <select name="recipe_id" className="w-full px-4 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              {recipes?.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors w-full md:w-auto">
            Guardar
          </button>
        </form>
      </div>

      {/* Cuadrícula de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dias.map(dia => (
          <div key={dia} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-800">{dia}</h3>
            </div>
            <div className="p-4 space-y-4">
              {tipos.map(tipo => {
                const plan = mealPlans?.find(p => p.day_of_week === dia && p.meal_type === tipo)
                const recipeData = plan?.recipes as any
                const tituloReceta = recipeData ? (Array.isArray(recipeData) ? recipeData[0]?.title : recipeData?.title) : null

                return (
                  <div key={tipo}>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">{tipo}</p>
                    <div className="bg-neutral-50 rounded-lg p-3 min-h-[3.5rem] flex items-center border border-neutral-100 text-sm">
                      {tituloReceta ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-neutral-900">{tituloReceta}</span>
                          <form action={deleteMeal}>
                            <input type="hidden" name="plan_id" value={plan?.id} />
                            <button type="submit" className="text-red-500 hover:text-white hover:bg-red-500 font-bold px-2 py-0.5 rounded transition-colors" title="Quitar del menú">
                              ✕
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Sin asignar</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}