import { createClient } from '@/utils/supabase/server';
import FormularioEditar from './FormularioEditar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// 1. Cambiamos el tipo de params para decirle que es una Promesa
export default async function EditarRecetaPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. Extraemos el id esperando a que la promesa se resuelva
  const resolvedParams = await params;
  const recipeId = resolvedParams.id;

  const supabase = await createClient();

  // Descargamos catálogos completos
  const { data: units } = await supabase.from('units').select('*').order('name');
  const { data: ingredients } = await supabase.from('ingredients').select('*').order('name');
  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: tags } = await supabase.from('tags').select('*').order('name');

  // Descargamos la receta usando el recipeId que ya "desempaquetamos"
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients ( quantity, unit_id, ingredient_id ),
      recipe_tags ( tag_id )
    `)
    .eq('id', recipeId) // Usamos la variable directa
    .single();

  if (error || !recipe) {
    redirect('/admin/administrar');
  }

  // Extraemos solo los IDs de las etiquetas que ya tiene para que sea más fácil leerlos
  const etiquetasActuales = recipe.recipe_tags?.map((rt: any) => rt.tag_id) || [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-neutral-900">Editar Receta</h1>
        <Link href="/admin/administrar" className="text-neutral-500 hover:text-neutral-700 font-medium">
          ← Volver a administración
        </Link>
      </div>
      
      {/* Pasamos TODO al formulario de edición */}
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
  );
}