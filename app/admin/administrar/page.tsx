import { createClient } from '@/utils/supabase/server';
import { eliminarReceta } from '../actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdministrarRecetasPage() {
  const supabase = await createClient();
  
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Mis Platillos</h1>
          
          <Link 
            href="/admin" 
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium inline-flex items-center gap-2 transition-colors"
          >
            ← Volver a Nueva Receta
          </Link>
        </div>
        
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-neutral-200 dark:border-stone-800 overflow-hidden transition-colors">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-stone-800/60 border-b border-neutral-200 dark:border-stone-800">
              <tr>
                <th className="p-4 font-semibold text-neutral-600 dark:text-stone-300">Título del Platillo</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-stone-300">Estado</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-stone-300 hidden md:table-cell">Fecha</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-stone-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-stone-800">
              {recipes && recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-neutral-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="p-4 font-medium text-neutral-900 dark:text-stone-100">{recipe.title}</td>
                    
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        recipe.status === 'published' 
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}>
                        {recipe.status === 'published' ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>

                    <td className="p-4 text-neutral-500 dark:text-stone-400 text-sm hidden md:table-cell">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-4">
                      <Link 
                        href={`/admin/editar/${recipe.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-bold transition-colors"
                      >
                        Editar
                      </Link>
                      
                      <form action={eliminarReceta} className="inline-block">
                        <input type="hidden" name="id" value={recipe.id} />
                        <button 
                          type="submit" 
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-bold transition-colors cursor-pointer"
                        >
                          Borrar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-neutral-500 dark:text-stone-400">
                    Aún no hay recetas creadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}