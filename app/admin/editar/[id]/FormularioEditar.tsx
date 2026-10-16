'use client';

import { useState } from 'react';
import { actualizarReceta } from '../../actions';

export default function FormularioEditar({ 
  recipe, 
  initialIngredients = [], 
  etiquetasActuales = [], 
  units = [], 
  ingredients = [], 
  categories = [], 
  tags = [] 
}: any) {
  
  const [listaIngredientes, setListaIngredientes] = useState(
    initialIngredients?.length > 0 
      ? initialIngredients 
      : [{ quantity: '', unit_id: '', ingredient_id: '', group_name: '', is_optional: false }]
  );
  const [imagen, setImagen] = useState<File | null>(null);
  const [estaGuardando, setEstaGuardando] = useState(false);

  const agregarFila = () => setListaIngredientes([...listaIngredientes, { quantity: '', unit_id: '', ingredient_id: '', group_name: '', is_optional: false }]);

  const actualizarFila = (index: number, campo: string, valor: any) => {
    const nuevaLista = [...listaIngredientes];
    nuevaLista[index] = { ...nuevaLista[index], [campo]: valor };
    setListaIngredientes(nuevaLista);
  };

  const quitarFila = (index: number) => {
    const nuevaLista = listaIngredientes.filter((_: any, i: number) => i !== index);
    setListaIngredientes(nuevaLista);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEstaGuardando(true);
    const formData = new FormData(e.currentTarget);

    // Si seleccionó un archivo nuevo al editar, lo subimos a Cloudinary
    if (imagen) {
      const cloudData = new FormData();
      cloudData.append('file', imagen);
      cloudData.append('upload_preset', 'recetas_rosi');
      cloudData.append('cloud_name', 'alonsopp26');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/alonsopp26/image/upload', {
          method: 'POST',
          body: cloudData,
        });
        const data = await res.json();
        if (data.secure_url) {
          formData.set('image_url', data.secure_url);
        }
      } catch (error) {
        console.error("Error al subir a Cloudinary:", error);
        alert("Hubo un problema subiendo la nueva imagen a Cloudinary.");
        setEstaGuardando(false);
        return;
      }
    }

    await actualizarReceta(recipe.id, formData, listaIngredientes);
  };

  const inputClass = "w-full border border-neutral-300 dark:border-stone-700 rounded-md p-2 bg-white dark:bg-stone-800 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-colors";
  const labelClass = "block text-sm font-medium mb-1 text-neutral-700 dark:text-stone-300";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-stone-800 space-y-6 transition-colors">
      
      {/* TÍTULO, TIEMPO, PORCIONES, CATEGORÍA, DIFICULTAD, RATING Y ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className={labelClass}>Título de la receta</label>
          <input type="text" name="title" defaultValue={recipe.title} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Tiempo (min)</label>
          <input type="number" name="prep_time" defaultValue={recipe.prep_time_minutes} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Porciones</label>
          <input type="number" name="servings" defaultValue={recipe.servings || 4} className={inputClass} required />
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select name="category_id" defaultValue={recipe.category_id || ""} className={inputClass} required>
            <option value="">Selecciona una...</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Dificultad (Etiqueta)</label>
          <select name="difficulty" defaultValue={recipe.difficulty || "Fácil"} className={inputClass}>
            <option value="Fácil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Calificación (★)</label>
          <input type="number" step="0.1" min="1" max="5" name="rating" defaultValue={recipe.rating || 4.8} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Estado de publicación</label>
          <select name="status" defaultValue={recipe.status || "published"} className={inputClass} required>
            <option value="published">Publicada (Visible)</option>
            <option value="draft">Borrador (Oculta)</option>
            <option value="archived">Archivada</option>
          </select>
        </div>
      </div>

      {/* IMAGEN DE LA RECETA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-stone-50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
        <div>
          <label className={labelClass}>URL de la Imagen actual</label>
          <input 
            type="text" 
            name="image_url" 
            defaultValue={recipe.image_url || ''} 
            placeholder="https://..." 
            className={inputClass} 
          />
          <p className="text-xs text-stone-400 mt-1">Puedes pegar un enlace directo o subir un archivo a la derecha.</p>
        </div>
        <div>
          <label className={labelClass}>O subir nueva foto a Cloudinary</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImagen(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-stone-500 dark:text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/30 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer" 
          />
          {imagen && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              Nueva imagen seleccionada: {imagen.name}
            </p>
          )}
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className={labelClass}>Descripción corta</label>
        <textarea name="description" defaultValue={recipe.description} className={inputClass} rows={2}></textarea>
      </div>

      {/* 🏷️ ETIQUETAS (TAGS) */}
      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md border border-orange-100 dark:border-orange-900/40">
        <label className="block text-sm font-bold text-orange-900 dark:text-orange-300 mb-3">🏷️ Etiquetas (Selecciona varias)</label>
        <div className="flex flex-wrap gap-3">
          {tags?.map((tag: any) => {
            const estaMarcada = etiquetasActuales.includes(tag.id);
            return (
              <label key={tag.id} className="flex items-center gap-2 bg-white dark:bg-stone-800 px-3 py-2 rounded-full border border-orange-200 dark:border-orange-800/60 cursor-pointer hover:bg-orange-100 dark:hover:bg-stone-700 transition-colors shadow-sm">
                <input 
                  type="checkbox" 
                  name="tags" 
                  value={tag.id} 
                  defaultChecked={estaMarcada} 
                  className="accent-orange-600 w-4 h-4" 
                />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">#{tag.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 🛒 INGREDIENTES */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-md border border-emerald-100 dark:border-emerald-900/40 space-y-4">
        <h3 className="font-bold text-emerald-900 dark:text-emerald-300">🛒 Ingredientes</h3>
        {listaIngredientes.map((ing: any, index: number) => (
          <div key={index} className="flex flex-col gap-2 p-3 bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-800/50 rounded-md shadow-sm">
            
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" placeholder="Grupo (ej: Para la salsa, Glaseado)" className="flex-1 border border-neutral-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-neutral-900 dark:text-white rounded p-1.5 text-sm outline-none focus:border-emerald-500"
                value={ing.group_name || ''} onChange={(e) => actualizarFila(index, 'group_name', e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-stone-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" checked={ing.is_optional || false} onChange={(e) => actualizarFila(index, 'is_optional', e.target.checked)} 
                  className="accent-emerald-600 w-4 h-4" 
                />
                Opcional
              </label>
              {index > 0 && (
                <button type="button" onClick={() => quitarFila(index)} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded hover:bg-red-200 font-bold text-xs transition-colors cursor-pointer" title="Quitar ingrediente">✕</button>
              )}
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <input 
                type="number" step="0.01" placeholder="Cant. (Vacío = Al gusto)" className="w-36 border border-neutral-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-neutral-900 dark:text-white rounded p-2 outline-none focus:border-emerald-500 text-sm"
                value={ing.quantity ?? ''} onChange={(e) => actualizarFila(index, 'quantity', e.target.value)} 
                title="Déjalo vacío si es 'Al gusto'"
              />
              <select className="w-36 border border-neutral-300 dark:border-stone-700 rounded p-2 bg-white dark:bg-stone-900 text-neutral-900 dark:text-white outline-none focus:border-emerald-500 text-sm" value={ing.unit_id || ''} onChange={(e) => actualizarFila(index, 'unit_id', e.target.value)}>
                <option value="">Sin unidad / Al gusto</option>
                {units?.map((u: any) => <option key={u.id} value={u.id}>{u.abbreviation} ({u.name})</option>)}
              </select>
              <select className="flex-1 border border-neutral-300 dark:border-stone-700 rounded p-2 bg-white dark:bg-stone-900 text-neutral-900 dark:text-white outline-none focus:border-emerald-500 text-sm" value={ing.ingredient_id || ''} onChange={(e) => actualizarFila(index, 'ingredient_id', e.target.value)} required>
                <option value="">Selecciona ingrediente...</option>
                {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={agregarFila} className="mt-2 text-sm text-emerald-700 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors inline-block cursor-pointer">
          + Agregar otro ingrediente
        </button>
      </div>

      {/* INSTRUCCIONES */}
      <div>
        <label className={labelClass}>Instrucciones</label>
        <textarea name="instructions" defaultValue={recipe.instructions} className={inputClass} rows={6} required></textarea>
      </div>

      <button 
        type="submit" 
        disabled={estaGuardando}
        className={`w-full font-bold px-6 py-3 rounded-md transition-colors shadow-sm cursor-pointer ${
          estaGuardando ? 'bg-neutral-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {estaGuardando ? 'Subiendo y guardando cambios...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}