'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// 🟢 C: CREATE (Crear)
export async function guardarRecetaCompleta(formData: FormData, listaIngredientes: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guardar la receta principal con categoría e imagen
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([{
      title: formData.get('title'),
      description: formData.get('description'),
      prep_time_minutes: formData.get('prep_time'),
      instructions: formData.get('instructions'),
      image_url: formData.get('image_url') || null,
      category_id: formData.get('category_id') || null,
      author_id: user?.id
    }])
    .select()
    .single();

  if (recipeError) {
    console.error("Error al guardar receta:", recipeError);
    return;
  }

  // 2. Guardar los ingredientes relacionales
  if (listaIngredientes.length > 0) {
    const relaciones = listaIngredientes.map(ing => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredient_id,
      unit_id: ing.unit_id,
      quantity: ing.quantity
    }));
    await supabase.from('recipe_ingredients').insert(relaciones);
  }

  // 3. Guardar las etiquetas (Tags) seleccionadas
  const selectedTags = formData.getAll('tags');
  if (selectedTags.length > 0) {
    const tagRelations = selectedTags.map(tagId => ({
      recipe_id: recipe.id,
      tag_id: tagId
    }));
    await supabase.from('recipe_tags').insert(tagRelations);
  }

  // 4. Actualizar pantallas y redireccionar
  revalidatePath('/admin');
  revalidatePath('/admin/administrar');
  revalidatePath('/recetas');
  redirect('/admin/administrar'); 
}

// 🔴 D: DELETE (Borrar)
export async function eliminarReceta(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  console.log("Intentando borrar receta con ID:", id);

  // 1. Borramos relaciones primero
  const { error: err1 } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
  if (err1) console.error("Fallo al borrar ingredientes:", err1);

  const { error: err2 } = await supabase.from('meal_plans').delete().eq('recipe_id', id);
  if (err2) console.error("Fallo al borrar del planificador:", err2);
  
  // 2. Borramos la receta principal (Las etiquetas se borran solas por el CASCADE)
  const { error: err3 } = await supabase.from('recipes').delete().eq('id', id);
  if (err3) console.error("Fallo al borrar la receta principal:", err3);

  // 3. Refrescar todas las pantallas
  revalidatePath('/admin');
  revalidatePath('/admin/administrar');
  revalidatePath('/recetas');
  revalidatePath('/planificador');
  revalidatePath('/lista');
}

// 🟡 U: UPDATE (Actualizar)
export async function actualizarReceta(id: string, formData: FormData, listaIngredientes: any[]) {
  const supabase = await createClient();

  // 1. Actualizar título, descripción, instrucciones y CATEGORÍA
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      title: formData.get('title'),
      description: formData.get('description'),
      prep_time_minutes: formData.get('prep_time'),
      instructions: formData.get('instructions'),
      category_id: formData.get('category_id') || null
    })
    .eq('id', id);

  if (recipeError) {
    console.error("Error actualizando receta:", recipeError);
    return;
  }

  // 2. Técnica de limpieza: Borramos los ingredientes viejos y guardamos los nuevos
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

  if (listaIngredientes.length > 0) {
    const relaciones = listaIngredientes.map(ing => ({
      recipe_id: id,
      ingredient_id: ing.ingredient_id,
      unit_id: ing.unit_id,
      quantity: ing.quantity
    }));
    await supabase.from('recipe_ingredients').insert(relaciones);
  }

  // 3. Etiquetas: Borramos las viejas e insertamos las nuevas marcadas
  await supabase.from('recipe_tags').delete().eq('recipe_id', id);
  
  const selectedTags = formData.getAll('tags');
  if (selectedTags.length > 0) {
    const tagRelations = selectedTags.map(tagId => ({
      recipe_id: id,
      tag_id: tagId
    }));
    await supabase.from('recipe_tags').insert(tagRelations);
  }

  // 4. Refrescar todas las pantallas y volver a la administración
  revalidatePath('/admin');
  revalidatePath('/admin/administrar');
  revalidatePath('/recetas');
  revalidatePath(`/recetas/${id}`);
  revalidatePath('/planificador');
  revalidatePath('/lista');
  
  redirect('/admin/administrar');
}