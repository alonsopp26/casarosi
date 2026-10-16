'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// 🟢 C: CREATE (Crear)
export async function guardarRecetaCompleta(formData: FormData, listaIngredientes: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guardar la receta principal (incluyendo dificultad, rating e imagen)
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([{
      title: formData.get('title'),
      description: formData.get('description'),
      prep_time_minutes: formData.get('prep_time'),
      servings: formData.get('servings') || 4,
      difficulty: formData.get('difficulty') || 'Fácil',
      rating: formData.get('rating') || 4.8,
      status: formData.get('status') || 'published',
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

  // 2. Guardar los ingredientes relacionales (con grupo, opcional y soporte para 'Al gusto')
  if (listaIngredientes.length > 0) {
    const relaciones = listaIngredientes.map(ing => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredient_id,
      // Si unit_id o quantity vienen vacíos "", los mandamos como null
      unit_id: ing.unit_id ? ing.unit_id : null,
      quantity: ing.quantity !== '' && ing.quantity !== null ? ing.quantity : null,
      group_name: ing.group_name || null,
      is_optional: Boolean(ing.is_optional)
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

  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) console.error("Fallo al borrar la receta:", error);

  revalidatePath('/admin');
  revalidatePath('/admin/administrar');
  revalidatePath('/recetas');
  revalidatePath('/planificador');
  revalidatePath('/lista');
}

// 🟡 U: UPDATE (Actualizar)
export async function actualizarReceta(id: string, formData: FormData, listaIngredientes: any[]) {
  const supabase = await createClient();

  // 1. Actualizar receta principal (incluyendo image_url, difficulty y rating)
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      title: formData.get('title'),
      description: formData.get('description'),
      prep_time_minutes: formData.get('prep_time'),
      servings: formData.get('servings') || 4,
      difficulty: formData.get('difficulty') || 'Fácil',
      rating: formData.get('rating') || 4.8,
      status: formData.get('status') || 'published',
      instructions: formData.get('instructions'),
      image_url: formData.get('image_url') || null,
      category_id: formData.get('category_id') || null
    })
    .eq('id', id);

  if (recipeError) {
    console.error("Error actualizando receta:", recipeError);
    return;
  }

  // 2. Limpiar y volver a insertar ingredientes
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

  if (listaIngredientes.length > 0) {
    const relaciones = listaIngredientes.map(ing => ({
      recipe_id: id,
      ingredient_id: ing.ingredient_id,
      unit_id: ing.unit_id ? ing.unit_id : null,
      quantity: ing.quantity !== '' && ing.quantity !== null ? ing.quantity : null,
      group_name: ing.group_name || null,
      is_optional: Boolean(ing.is_optional)
    }));
    await supabase.from('recipe_ingredients').insert(relaciones);
  }

  // 3. Limpiar y volver a insertar etiquetas
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