'use client';

import { useState } from 'react';
import { guardarRecetaCompleta } from './actions';

// Clases reutilizables con soporte para Modo Oscuro (dark:)
const inputBase =
  'w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-sm transition focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/40';
const labelBase = 'block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2';

export default function FormularioReceta({ units, ingredients, categories, tags }: any) {
  const [listaIngredientes, setListaIngredientes] = useState([
    { quantity: '', unit_id: '', ingredient_id: '', group_name: '', is_optional: false }
  ]);
  const [imagen, setImagen] = useState<File | null>(null);
  const [estaGuardando, setEstaGuardando] = useState(false);

  const agregarFila = () => setListaIngredientes([
    ...listaIngredientes, 
    { quantity: '', unit_id: '', ingredient_id: '', group_name: '', is_optional: false }
  ]);

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

    // ☁️ 1. MAGIA DE CLOUDINARY (Si subió un archivo desde su PC/Celular)
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
          // Sobrescribimos image_url con el link seguro de Cloudinary
          formData.set('image_url', data.secure_url);
        }
      } catch (error) {
        console.error("Error al subir a Cloudinary:", error);
        alert("Hubo un problema subiendo la imagen a Cloudinary.");
        setEstaGuardando(false);
        return;
      }
    }

    // 💾 2. GUARDAR EN SUPABASE (Llama a actions.ts)
    await guardarRecetaCompleta(formData, listaIngredientes);

    // 🧹 3. LIMPIAR FORMULARIO
    e.currentTarget.reset();
    setListaIngredientes([{ quantity: '', unit_id: '', ingredient_id: '', group_name: '', is_optional: false }]);
    setImagen(null);
    setEstaGuardando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-200/60 dark:shadow-black/40 ring-1 ring-stone-200/70 dark:ring-stone-800 space-y-6 sm:space-y-8 max-w-4xl mx-auto transition-colors">
      
      {/* SECCIÓN DE IMAGEN (Archivo a Cloudinary o Link directo) */}
      <div className="p-4 sm:p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-stone-900 text-center hover:border-emerald-500 transition-colors space-y-4">
        <div>
          <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 cursor-pointer">
            📸 Subir Foto del Platillo (Cloudinary)
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImagen(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-stone-500 dark:text-stone-400 file:mr-3 sm:file:mr-4 file:py-2.5 file:px-4 sm:file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:transition-colors cursor-pointer"
          />
          {imagen && <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100 dark:bg-emerald-900/40 inline-block px-3 py-1 rounded-full max-w-full truncate">Archivo listo: {imagen.name}</p>}
        </div>

        <div className="pt-3 border-t border-emerald-200/60 dark:border-stone-800 text-left">
          <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            O pega una URL de imagen directamente (opcional si no subes archivo):
          </label>
          <input 
            type="text" 
            name="image_url" 
            placeholder="https://images.unsplash.com/..." 
            className={inputBase} 
          />
        </div>
      </div>

      {/* TÍTULO, TIEMPO, PORCIONES, CATEGORÍA, DIFICULTAD, RATING Y ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <label className={labelBase}>Título de la receta</label>
          <input type="text" name="title" className={inputBase} placeholder="Ej. Enchiladas Suizas" required />
        </div>
        <div>
          <label className={labelBase}>Tiempo (min)</label>
          <input type="number" name="prep_time" inputMode="numeric" className={inputBase} placeholder="45" required />
        </div>
        <div>
          <label className={labelBase}>Porciones</label>
          <input type="number" name="servings" defaultValue={4} inputMode="numeric" className={inputBase} placeholder="4" required />
        </div>

        <div>
          <label className={labelBase}>Categoría</label>
          <select name="category_id" className={inputBase} required>
            <option value="">Selecciona una...</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 👇 NUEVO: Dificultad (Aparece en la esquina superior derecha de la tarjeta) */}
        <div>
          <label className={labelBase}>Dificultad</label>
          <select name="difficulty" defaultValue="Fácil" className={inputBase}>
            <option value="Fácil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        {/* 👇 NUEVO: Calificación (Aparece junto a la estrella ★ en la tarjeta) */}
        <div>
          <label className={labelBase}>Calificación (★)</label>
          <input type="number" step="0.1" min="1" max="5" name="rating" defaultValue={4.8} className={inputBase} />
        </div>

        <div>
          <label className={labelBase}>Estado</label>
          <select name="status" defaultValue="published" className={inputBase} required>
            <option value="published">Publicar inmediatamente</option>
            <option value="draft">Guardar como Borrador</option>
          </select>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className={labelBase}>Descripción corta</label>
        <textarea name="description" className={`${inputBase} resize-none`} rows={2} placeholder="Una breve descripción..."></textarea>
      </div>

      {/* 🏷️ SECCIÓN DE ETIQUETAS (TAGS) */}
      <div className="bg-orange-50/70 dark:bg-orange-950/20 p-4 sm:p-5 rounded-2xl border border-orange-200/70 dark:border-orange-900/40">
        <label className="block text-sm font-bold text-orange-900 dark:text-orange-300 mb-4">🏷️ Etiquetas (Selecciona varias)</label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tags?.map((tag: any) => (
            <label key={tag.id} className="flex items-center gap-2 bg-white dark:bg-stone-800 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full border border-orange-200 dark:border-orange-800/60 cursor-pointer hover:bg-orange-100 dark:hover:bg-stone-700 transition-colors shadow-sm has-[:checked]:bg-orange-100 dark:has-[:checked]:bg-orange-900/40 has-[:checked]:border-orange-400">
              <input type="checkbox" name="tags" value={tag.id} className="accent-orange-600 w-4 h-4" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">#{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🛒 SECCIÓN DE INGREDIENTES */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-4 sm:p-6 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40">
        <h3 className="font-serif text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-4 sm:mb-5">🛒 Ingredientes</h3>
        
        {listaIngredientes.map((ing: any, index: number) => (
          <div key={index} className="flex flex-col gap-3 mb-4 p-4 bg-white/70 sm:bg-white dark:bg-stone-800/90 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
              <input 
                type="text" placeholder="Grupo (Ej: Para la salsa, Glaseado)" className="flex-1 text-sm border-b border-stone-200 dark:border-stone-700 bg-transparent text-stone-800 dark:text-stone-100 px-2 py-1 outline-none focus:border-emerald-500"
                value={ing.group_name || ''} onChange={(e) => actualizarFila(index, 'group_name', e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" checked={ing.is_optional || false} onChange={(e) => actualizarFila(index, 'is_optional', e.target.checked)} 
                  className="accent-emerald-600 w-4 h-4" 
                />
                Opcional
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-[7rem_10rem_1fr_2.75rem] gap-3 items-center">
              {/* Cantidad opcional para 'Al gusto' */}
              <input 
                type="number" step="0.01" inputMode="decimal" placeholder="Cant." className={inputBase} title="Déjalo vacío si es 'Al gusto'"
                value={ing.quantity || ''} onChange={(e) => actualizarFila(index, 'quantity', e.target.value)} 
              />
              {/* 👇 SIN required para permitir ingredientes 'Al gusto' sin unidad */}
              <select className={inputBase} value={ing.unit_id || ''} onChange={(e) => actualizarFila(index, 'unit_id', e.target.value)}>
                <option value="">Sin unidad / Al gusto</option>
                {units?.map((u: any) => <option key={u.id} value={u.id}>{u.abbreviation} ({u.name})</option>)}
              </select>
              <select className={`${inputBase} col-span-2 sm:col-span-1`} value={ing.ingredient_id || ''} onChange={(e) => actualizarFila(index, 'ingredient_id', e.target.value)} required>
                <option value="">Ingrediente...</option>
                {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              
              {index > 0 ? (
                <button type="button" onClick={() => quitarFila(index)} aria-label="Quitar ingrediente" className="col-span-2 sm:col-span-1 h-11 w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 font-bold transition-colors cursor-pointer">
                  <span className="sm:hidden">Quitar ingrediente</span>
                  <span className="hidden sm:inline">✕</span>
                </button>
              ) : (
                <div className="hidden sm:block" aria-hidden="true"></div>
              )}
            </div>
          </div>
        ))}
        
        <button type="button" onClick={agregarFila} className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-1 text-sm text-emerald-700 dark:text-emerald-300 font-bold bg-white dark:bg-stone-800 px-4 py-3 sm:py-2 rounded-full border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
          + Agregar otro ingrediente
        </button>
      </div>

      {/* INSTRUCCIONES */}
      <div>
        <label className={labelBase}>Instrucciones</label>
        <textarea name="instructions" className={`${inputBase} leading-relaxed`} rows={6} placeholder="Paso 1..." required></textarea>
      </div>

      <button 
        type="submit" 
        disabled={estaGuardando}
        className={`w-full font-bold px-6 py-4 rounded-full transition-all duration-300 text-base sm:text-lg cursor-pointer ${
          estaGuardando
            ? 'bg-stone-400 text-white cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 md:hover:-translate-y-0.5 shadow-lg shadow-emerald-700/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200'
        }`}
      >
        {estaGuardando ? 'Subiendo imagen y guardando...' : 'Guardar Receta'}
      </button>
    </form>
  );
}