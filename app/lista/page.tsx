import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ListaSuperPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // 1. Buscamos todo lo que el usuario va a comer en la semana y traemos sus ingredientes exactos
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select(`
      recipes (
        recipe_ingredients (
          quantity,
          units ( abbreviation ),
          ingredients ( name )
        )
      )
    `)
    .eq('user_id', user.id);

  // 2. El algoritmo matemático: Agrupamos y sumamos
  const listaConsolidada: Record<string, { nombre: string; unidad: string; cantidad: number }> = {};

  mealPlans?.forEach((plan: any) => {
    // Si la receta fue borrada o no tiene ingredientes, saltamos
    const ingredientes = plan.recipes?.recipe_ingredients;
    if (!ingredientes) return;

    ingredientes.forEach((ing: any) => {
      // Creamos una llave única, ej: "Tomate saladet-pza"
      const nombreIngrediente = ing.ingredients?.name || 'Desconocido';
      const unidad = ing.units?.abbreviation || '';
      const llave = `${nombreIngrediente}-${unidad}`;

      if (!listaConsolidada[llave]) {
        listaConsolidada[llave] = {
          nombre: nombreIngrediente,
          unidad: unidad,
          cantidad: 0
        };
      }
      
      // Sumamos la cantidad
      listaConsolidada[llave].cantidad += Number(ing.quantity);
    });
  });

  // Convertimos el objeto en un arreglo y lo ordenamos alfabéticamente
  const ingredientesFinales = Object.values(listaConsolidada).sort((a, b) => 
    a.nombre.localeCompare(b.nombre)
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">🛒 Lista del Súper</h1>
        <button className="bg-neutral-100 text-neutral-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
          Imprimir lista
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {ingredientesFinales.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {ingredientesFinales.map((item, index) => (
              <li key={index} className="p-4 flex items-center hover:bg-neutral-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 mr-4 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-neutral-900 text-lg">{item.nombre}</span>
                </div>
                <div className="bg-emerald-50 text-emerald-800 font-bold px-4 py-1.5 rounded-full text-sm">
                  {item.cantidad} {item.unidad}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-lg">Tu lista está vacía.</p>
            <p className="text-sm mt-1">Agrega recetas en el Planificador Semanal para generar tu lista de compras.</p>
          </div>
        )}
      </div>
    </div>
  );
}