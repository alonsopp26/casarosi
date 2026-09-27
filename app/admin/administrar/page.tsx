import { createClient } from '@/utils/supabase/server';
import { eliminarReceta } from '../actions'; // Importamos usando ../
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdministrarRecetasPage() {
  const supabase = await createClient();
  
  // R: READ - Traemos las recetas guardadas
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-neutral-900">Mis Platillos</h1>
        
        <Link 
          href="/admin" 
          className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 transition-colors"
        >
          ← Volver a Nueva Receta
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 font-semibold text-neutral-600">Título del Platillo</th>
              <th className="p-4 font-semibold text-neutral-600 hidden md:table-cell">Fecha</th>
              <th className="p-4 font-semibold text-neutral-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-medium text-neutral-900">{recipe.title}</td>
                  <td className="p-4 text-neutral-500 text-sm hidden md:table-cell">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-4">
                    
                  {/* Botón U: UPDATE (Actualizar) */}
                    <Link 
                      href={`/admin/editar/${recipe.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors"
                    >
                      Editar
                    </Link>
                    
                    <form action={eliminarReceta} className="inline-block">
                      <input type="hidden" name="id" value={recipe.id} />
                      <button 
                        type="submit" 
                        className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                      >
                        Borrar
                      </button>
                    </form>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-12 text-center text-neutral-500">
                  Aún no hay recetas creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}