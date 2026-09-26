'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function guardarRecetaCompleta(formData: FormData, listaIngredientes: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guardar la receta principal
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([{
      title: formData.get('title'),
      description: formData.get('description'),
      prep_time_minutes: formData.get('prep_time'),
      instructions: formData.get('instructions'),
      author_id: user?.id
    }])
    .select() // Necesario para que nos devuelva el ID de la receta recién creada
    .single();

  if (recipeError) {
    console.error("Error guardando receta:", recipeError);
    return;
  }

  // 2. Guardar los ingredientes en la tabla pivote usando el ID de la receta
  if (listaIngredientes.length > 0) {
    const relaciones = listaIngredientes.map(ing => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredient_id,
      unit_id: ing.unit_id,
      quantity: ing.quantity
    }));

    const { error: pivotError } = await supabase
      .from('recipe_ingredients')
      .insert(relaciones);

    if (pivotError) {
      console.error("Error en tabla relacional:", pivotError);
    }
  }

  // 3. Redirigir al catálogo
  redirect('/recetas');
}