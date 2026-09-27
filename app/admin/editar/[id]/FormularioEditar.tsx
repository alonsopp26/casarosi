'use client';

import { useState } from 'react';
import { actualizarReceta } from '../../actions';

// Le damos un valor por defecto = [] a todas las listas para evitar errores "undefined"
export default function FormularioEditar({ 
  recipe, 
  initialIngredients = [], 
  etiquetasActuales = [], 
  units = [], 
  ingredients = [], 
  categories = [], 
  tags = [] 
}: any) {
  
  // Usamos ?.length para verificar de forma segura
  const [listaIngredientes, setListaIngredientes] = useState(
    initialIngredients?.length > 0 ? initialIngredients : [{ quantity: '', unit_id: '', ingredient_id: '' }]
  );
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

    await actualizarReceta(recipe.id, formData, listaIngredientes);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 space-y-6">
      
      {/* TÍTULO, TIEMPO Y CATEGORÍA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título de la receta</label>
          <input type="text" name="title" defaultValue={recipe.title} className="w-full border rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tiempo (min)</label>
          <input type="number" name="prep_time" defaultValue={recipe.prep_time_minutes} className="w-full border rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <select name="category_id" defaultValue={recipe.category_id || ""} className="w-full border rounded-md p-2 bg-white" required>
            <option value="">Selecciona una...</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block text-sm font-medium mb-2">Descripción corta</label>
        <textarea name="description" defaultValue={recipe.description} className="w-full border rounded-md p-2" rows={2}></textarea>
      </div>

      {/* 🏷️ ETIQUETAS (TAGS) */}
      <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
        <label className="block text-sm font-bold text-orange-900 mb-3">🏷️ Etiquetas (Selecciona varias)</label>
        <div className="flex flex-wrap gap-3">
          {tags?.map((tag: any) => {
            const estaMarcada = etiquetasActuales.includes(tag.id);
            return (
              <label key={tag.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors shadow-sm">
                <input 
                  type="checkbox" 
                  name="tags" 
                  value={tag.id} 
                  defaultChecked={estaMarcada} 
                  className="accent-orange-600 w-4 h-4" 
                />
                <span className="text-sm font-medium text-orange-800">#{tag.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 🛒 INGREDIENTES */}
      <div className="bg-emerald-50 p-5 rounded-md border border-emerald-100">
        <h3 className="font-bold text-emerald-900 mb-4">🛒 Ingredientes</h3>
        {listaIngredientes.map((ing: any, index: number) => (
          <div key={index} className="flex flex-wrap md:flex-nowrap gap-2 mb-3">
            <input 
              type="number" step="0.1" placeholder="Cant." className="w-24 border rounded p-2"
              value={ing.quantity} onChange={(e) => actualizarFila(index, 'quantity', e.target.value)} required
            />
            <select className="w-32 border rounded p-2 bg-white" value={ing.unit_id} onChange={(e) => actualizarFila(index, 'unit_id', e.target.value)} required>
              <option value="">Unidad...</option>
              {units?.map((u: any) => <option key={u.id} value={u.id}>{u.abbreviation}</option>)}
            </select>
            <select className="flex-1 border rounded p-2 bg-white" value={ing.ingredient_id} onChange={(e) => actualizarFila(index, 'ingredient_id', e.target.value)} required>
              <option value="">Ingrediente...</option>
              {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            {index > 0 && (
              <button type="button" onClick={() => quitarFila(index)} className="px-3 py-2 md:py-0 bg-red-100 text-red-600 rounded hover:bg-red-200 font-bold">X</button>
            )}
          </div>
        ))}
        <button type="button" onClick={agregarFila} className="mt-2 text-sm text-emerald-700 font-bold hover:text-emerald-800">+ Agregar otro ingrediente</button>
      </div>

      {/* INSTRUCCIONES */}
      <div>
        <label className="block text-sm font-medium mb-2">Instrucciones</label>
        <textarea name="instructions" defaultValue={recipe.instructions} className="w-full border rounded-md p-2" rows={4} required></textarea>
      </div>

      <button 
        type="submit" 
        disabled={estaGuardando}
        className={`w-full font-bold px-6 py-3 rounded-md transition-colors ${
          estaGuardando ? 'bg-neutral-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {estaGuardando ? 'Actualizando receta...' : 'Actualizar Receta'}
      </button>
    </form>
  );
}