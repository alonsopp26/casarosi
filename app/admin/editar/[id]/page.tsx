import { createClient } from '@/utils/supabase/server';
import FormularioEditar from './FormularioEditar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditarRecetaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const recipeId = resolvedParams.id;

  const supabase = await createClient();

  const { data: units } = await supabase.from('units').select('*').order('name');
  const { data: ingredients } = await supabase.from('ingredients').select('*').order('name');
  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: tags } = await supabase.from('tags').select('*').order('name');

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients ( id, quantity, unit_id, ingredient_id, group_name, is_optional ),
      recipe_tags ( tag_id )
    `)
    .eq('id', recipeId)
    .single();

  if (error || !recipe) {
    redirect('/admin/administrar');
  }

  const etiquetasActuales = recipe.recipe_tags?.map((rt: any) => rt.tag_id) || [];

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Editar Receta</h1>
          <Link href="/admin/administrar" className="text-neutral-500 dark:text-stone-400 hover:text-neutral-700 dark:hover:text-stone-200 font-medium transition-colors">
            ← Volver a administración
          </Link>
        </div>
        
        <FormularioEditar 
          recipe={recipe} 
          initialIngredients={recipe.recipe_ingredients || []}
          etiquetasActuales={etiquetasActuales}
          units={units || []} 
          ingredients={ingredients || []}
          categories={categories || []}
          tags={tags || []}
        />
      </div>
    </div>
  );
}