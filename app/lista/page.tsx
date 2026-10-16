import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ListaSuperPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // 1. Traemos los planes incluyendo los nuevos campos: custom_servings, servings de la receta y is_optional
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select(`
      custom_servings,
      recipes (
        servings,
        recipe_ingredients (
          quantity,
          is_optional,
          units ( abbreviation ),
          ingredients ( name )
        )
      )
    `)
    .eq('user_id', user.id);

  // 2. El algoritmo matemático: Agrupamos, calculamos proporciones y sumamos
  const listaConsolidada: Record<string, { nombre: string; unidad: string; cantidad: number; alGusto: boolean }> = {};

  mealPlans?.forEach((plan: any) => {
    const receta = Array.isArray(plan.recipes) ? plan.recipes[0] : plan.recipes;
    const ingredientes = receta?.recipe_ingredients;
    if (!ingredientes) return;

    // Calculamos el multiplicador de porciones (Ej: Planeo 8 porciones / Receta rinde 4 = Multiplicador 2x)
    const porcionesOriginales = receta.servings || 4;
    const porcionesPlaneadas = plan.custom_servings || porcionesOriginales;
    const multiplicador = porcionesPlaneadas / porcionesOriginales;

    ingredientes.forEach((ing: any) => {
      // Ignoramos los ingredientes que el usuario marcó como opcionales en la receta
      if (ing.is_optional) return;

      const nombreIngrediente = ing.ingredients?.name || 'Desconocido';
      const unidad = ing.units?.abbreviation || '';
      const llave = `${nombreIngrediente}-${unidad}`;
      const esAlGusto = ing.quantity === null;

      if (!listaConsolidada[llave]) {
        listaConsolidada[llave] = {
          nombre: nombreIngrediente,
          unidad: esAlGusto ? '' : unidad,
          cantidad: 0,
          alGusto: esAlGusto
        };
      }
      
      // Si tiene cantidad numérica, la multiplicamos por la proporción de porciones y sumamos
      if (!esAlGusto) {
        listaConsolidada[llave].cantidad += (Number(ing.quantity) * multiplicador);
      }
    });
  });

  // Convertimos el objeto en un arreglo y lo ordenamos alfabéticamente
  const ingredientesFinales = Object.values(listaConsolidada).sort((a, b) => 
    a.nombre.localeCompare(b.nombre)
  );

  return (
    // Contenedor global con soporte para modo claro y oscuro
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="p-8 max-w-4xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white transition-colors">
            🛒 Lista del Súper
          </h1>
          <button 
            type="button"
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-neutral-700 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
          >
            🖨️ Imprimir lista
          </button>
        </div>

        {/* CONTENEDOR DE LA LISTA */}
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-neutral-200 dark:border-stone-800 overflow-hidden transition-colors">
          {ingredientesFinales.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-stone-800">
              {ingredientesFinales.map((item, index) => (
                <li key={index} className="hover:bg-neutral-50 dark:hover:bg-stone-800/50 transition-colors group">
                  <label className="p-4 flex items-center cursor-pointer w-full">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-emerald-600 border-neutral-300 dark:border-stone-700 rounded focus:ring-emerald-500 mr-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-neutral-900 dark:text-stone-100 text-lg group-has-[:checked]:line-through group-has-[:checked]:text-neutral-400 dark:group-has-[:checked]:text-stone-600 transition-all">
                        {item.nombre}
                      </span>
                    </div>
                    <div className={`font-bold px-4 py-1.5 rounded-full text-sm transition-all ${
                      item.alGusto 
                        ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 group-has-[:checked]:bg-neutral-100 dark:group-has-[:checked]:bg-stone-800 group-has-[:checked]:text-neutral-400 dark:group-has-[:checked]:text-stone-600' 
                        : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 group-has-[:checked]:bg-neutral-100 dark:group-has-[:checked]:bg-stone-800 group-has-[:checked]:text-neutral-400 dark:group-has-[:checked]:text-stone-600'
                    }`}>
                      {item.alGusto ? 'Al gusto' : `${Number(item.cantidad.toFixed(2))} ${item.unidad}`}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-neutral-500 dark:text-stone-400">
              <p className="text-4xl mb-4">🛒</p>
              <p className="text-lg font-medium text-neutral-700 dark:text-stone-200">Tu lista está vacía.</p>
              <p className="text-sm mt-1">Agrega recetas en el Planificador Semanal para generar tu lista de compras.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}