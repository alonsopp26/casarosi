'use client';

import { useState } from 'react';
import { guardarRecetaCompleta } from './actions';

// Clases reutilizables para inputs (solo estilos).
// text-base en celular evita el zoom automático de iPhone al enfocar un campo.
const inputBase =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 sm:py-2.5 text-base sm:text-sm text-stone-800 placeholder:text-stone-400 shadow-sm transition focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';
const labelBase = 'block text-sm font-semibold text-stone-700 mb-2';

export default function FormularioReceta({ units, ingredients, categories, tags }: any) {
  const [listaIngredientes, setListaIngredientes] = useState([{ quantity: '', unit_id: '', ingredient_id: '' }]);
  const [imagen, setImagen] = useState<File | null>(null);
  const [estaGuardando, setEstaGuardando] = useState(false);

  const agregarFila = () => setListaIngredientes([...listaIngredientes, { quantity: '', unit_id: '', ingredient_id: '' }]);

  const actualizarFila = (index: number, campo: string, valor: string) => {
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

    // ☁️ 1. MAGIA DE CLOUDINARY
    if (imagen) {
      const cloudData = new FormData();
      cloudData.append('file', imagen);
      cloudData.append('upload_preset', 'recetas_rosi'); // Tu preset
      cloudData.append('cloud_name', 'alonsopp26');      // Tu nube

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/alonsopp26/image/upload', {
          method: 'POST',
          body: cloudData,
        });
        const data = await res.json();
        
        if (data.secure_url) {
          formData.append('image_url', data.secure_url);
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
    setListaIngredientes([{ quantity: '', unit_id: '', ingredient_id: '' }]);
    setImagen(null);
    setEstaGuardando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-200/60 ring-1 ring-stone-200/70 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      
      {/* SECCIÓN DE IMAGEN */}
      <div className="p-4 sm:p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-50 to-white text-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
        <label className="block text-sm font-bold text-emerald-800 mb-3 cursor-pointer">
          📸 Foto del Platillo
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImagen(e.target.files ? e.target.files[0] : null)}
          className="w-full text-sm text-stone-500 file:mr-3 sm:file:mr-4 file:py-2.5 file:px-4 sm:file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:transition-colors cursor-pointer"
        />
        {imagen && <p className="mt-3 text-xs text-emerald-700 font-medium bg-emerald-100 inline-block px-3 py-1 rounded-full max-w-full truncate">Archivo: {imagen.name}</p>}
      </div>

      {/* TÍTULO, TIEMPO Y CATEGORÍA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className={labelBase}>Título de la receta</label>
          <input type="text" name="title" className={inputBase} placeholder="Ej. Enchiladas" required />
        </div>
        <div>
          <label className={labelBase}>Tiempo (min)</label>
          <input type="number" name="prep_time" inputMode="numeric" className={inputBase} placeholder="45" required />
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
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className={labelBase}>Descripción corta</label>
        <textarea name="description" className={`${inputBase} resize-none`} rows={2} placeholder="Una breve descripción..."></textarea>
      </div>

      {/* 🏷️ SECCIÓN DE ETIQUETAS (TAGS) */}
      <div className="bg-orange-50/70 p-4 sm:p-5 rounded-2xl border border-orange-200/70">
        <label className="block text-sm font-bold text-orange-900 mb-4">🏷️ Etiquetas (Selecciona varias)</label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tags?.map((tag: any) => (
            <label key={tag.id} className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-full border border-orange-200 cursor-pointer hover:bg-orange-100 hover:border-orange-300 transition-colors shadow-sm has-[:checked]:bg-orange-100 has-[:checked]:border-orange-400">
              <input type="checkbox" name="tags" value={tag.id} className="accent-orange-600 w-4 h-4" />
              <span className="text-sm font-medium text-orange-800">#{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🛒 SECCIÓN DE INGREDIENTES */}
      <div className="bg-emerald-50/70 p-4 sm:p-6 rounded-2xl border border-emerald-200/70">
        <h3 className="font-serif text-lg font-bold text-emerald-900 mb-4 sm:mb-5">🛒 Ingredientes</h3>
        
        {listaIngredientes.map((ing: any, index: number) => (
          // Celular: cantidad y unidad en una fila, ingrediente abajo, botón quitar abajo.
          // PC: todo en una sola fila.
          <div
            key={index}
            className="grid grid-cols-2 sm:grid-cols-[6rem_8rem_1fr_2.75rem] gap-3 mb-3 items-center bg-white/70 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-emerald-100 sm:border-0"
          >
            <input 
              type="number" step="0.1" inputMode="decimal" placeholder="Cant." className={inputBase}
              value={ing.quantity} onChange={(e) => actualizarFila(index, 'quantity', e.target.value)} required
            />
            <select className={inputBase} value={ing.unit_id} onChange={(e) => actualizarFila(index, 'unit_id', e.target.value)} required>
              <option value="">Unidad...</option>
              {units?.map((u: any) => <option key={u.id} value={u.id}>{u.abbreviation}</option>)}
            </select>
            <select className={`${inputBase} col-span-2 sm:col-span-1`} value={ing.ingredient_id} onChange={(e) => actualizarFila(index, 'ingredient_id', e.target.value)} required>
              <option value="">Ingrediente...</option>
              {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            {index > 0 ? (
              <button
                type="button"
                onClick={() => quitarFila(index)}
                aria-label="Quitar ingrediente"
                className="col-span-2 sm:col-span-1 h-11 w-full bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700 active:bg-red-200 font-bold transition-colors"
              >
                <span className="sm:hidden">Quitar ingrediente</span>
                <span className="hidden sm:inline">X</span>
              </button>
            ) : (
              <div className="hidden sm:block" aria-hidden="true"></div>
            )}
          </div>
        ))}
        <button type="button" onClick={agregarFila} className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-1 text-sm text-emerald-700 font-bold bg-white px-4 py-3 sm:py-2 rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 active:bg-emerald-200 transition-colors">
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
        className={`w-full font-bold px-6 py-4 rounded-full transition-all duration-300 text-base sm:text-lg ${
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