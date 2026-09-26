import { createClient } from '@/utils/supabase/server';
import FormularioReceta from './FormularioReceta';

// Esto obliga a Next.js a buscar datos frescos en lugar de usar su caché
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // Descargamos los datos y capturamos posibles errores
  const { data: units, error: unitsError } = await supabase.from('units').select('*').order('name');
  const { data: ingredients, error: ingredientsError } = await supabase.from('ingredients').select('*').order('name');

  // Esto se imprimirá en la TERMINAL de VS Code (no en el navegador)
  console.log("Unidades devueltas por Supabase:", units);
  if (unitsError) console.error("Error en unidades:", unitsError);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <FormularioReceta 
        units={units || []} 
        ingredients={ingredients || []} 
      />
    </div>
  );
}