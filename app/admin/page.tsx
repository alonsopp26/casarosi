import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  async function createRecipe(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) return

    const newRecipe = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      ingredients: formData.get('ingredients') as string,
      instructions: formData.get('instructions') as string,
      prep_time_minutes: parseInt(formData.get('prep_time') as string),
      image_url: formData.get('image_url') as string,
      author_id: user.id
    }

    const { error } = await supabaseServer.from('recipes').insert(newRecipe)
    
    if (error) {
      console.error('Error al guardar la receta:', error)
    } else {
      revalidatePath('/admin') 
      revalidatePath('/recetas') 
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <h2 className="text-xl font-semibold mb-6">Agregar Nueva Receta</h2>
        
        <form action={createRecipe} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Título de la receta</label>
              <input required type="text" id="title" name="title" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label htmlFor="prep_time" className="block text-sm font-medium text-neutral-700">Tiempo de preparación (minutos)</label>
              <input required type="number" id="prep_time" name="prep_time" min="1" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700">Descripción corta</label>
            <textarea required id="description" name="description" rows={2} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ingredients" className="block text-sm font-medium text-neutral-700">Ingredientes</label>
              <textarea required id="ingredients" name="ingredients" rows={5} placeholder="- 2 tomates&#10;- 1 cebolla..." className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
            </div>

            <div className="space-y-2">
              <label htmlFor="instructions" className="block text-sm font-medium text-neutral-700">Instrucciones</label>
              <textarea required id="instructions" name="instructions" rows={5} placeholder="1. Picar la cebolla&#10;2. Freír los tomates..." className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="image_url" className="block text-sm font-medium text-neutral-700">URL de la imagen (opcional)</label>
            <input type="url" id="image_url" name="image_url" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button type="submit" className="bg-emerald-600 text-white font-medium px-8 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
              Guardar Receta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}