'use client';

import { useState } from 'react';
import { guardarRecetaCompleta } from './actions';

export default function FormularioReceta({ units, ingredients }: { units: any[], ingredients: any[] }) {
  // Estado para manejar múltiples ingredientes
  const [listaIngredientes, setListaIngredientes] = useState([
    { quantity: '', unit_id: '', ingredient_id: '' }
  ]);

  const agregarFila = () => {
    setListaIngredientes([...listaIngredientes, { quantity: '', unit_id: '', ingredient_id: '' }]);
  };

  const actualizarFila = (index: number, campo: string, valor: string) => {
    const nuevaLista = [...listaIngredientes];
    nuevaLista[index] = { ...nuevaLista[index], [campo]: valor };
    setListaIngredientes(nuevaLista);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Ejecutamos la acción del servidor pasando el formulario y nuestra lista relacional
    await guardarRecetaCompleta(formData, listaIngredientes);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título de la receta</label>
          <input type="text" name="title" className="w-full border rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tiempo (minutos)</label>
          <input type="number" name="prep_time" className="w-full border rounded-md p-2" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descripción corta</label>
        <textarea name="description" className="w-full border rounded-md p-2" rows={2}></textarea>
      </div>

      {/* Sección Relacional de Ingredientes */}
      <div className="bg-emerald-50 p-5 rounded-md border border-emerald-100">
        <h3 className="font-bold text-emerald-900 mb-4">🛒 Ingredientes Exactos (Motor de Compras)</h3>
        
        {listaIngredientes.map((ing, index) => (
          <div key={index} className="flex gap-4 mb-3">
            <input 
              type="number" step="0.1" placeholder="Cant. (Ej. 1.5)" 
              className="w-32 border rounded p-2"
              value={ing.quantity}
              onChange={(e) => actualizarFila(index, 'quantity', e.target.value)}
              required
            />
            
            <select 
              className="w-40 border rounded p-2 bg-white"
              value={ing.unit_id}
              onChange={(e) => actualizarFila(index, 'unit_id', e.target.value)}
              required
            >
              <option value="">Unidad...</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.abbreviation} - {u.name}</option>)}
            </select>

            <select 
              className="flex-1 border rounded p-2 bg-white"
              value={ing.ingredient_id}
              onChange={(e) => actualizarFila(index, 'ingredient_id', e.target.value)}
              required
            >
              <option value="">Ingrediente...</option>
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
        ))}

        <button 
          type="button" 
          onClick={agregarFila}
          className="mt-2 text-sm text-emerald-700 font-bold hover:text-emerald-800"
        >
          + Agregar otro ingrediente
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Instrucciones</label>
        <textarea name="instructions" className="w-full border rounded-md p-2" rows={4} required></textarea>
      </div>

      <button type="submit" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 w-full font-bold">
        Guardar Receta en Base de Datos
      </button>
    </form>
  );
}