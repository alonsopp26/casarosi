import { createClient } from '@/utils/supabase/server';
import FormularioReceta from './FormularioReceta';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // Descargamos catálogos de la base de datos
  const { data: units } = await supabase.from('units').select('*').order('name');
  const { data: ingredients } = await supabase.from('ingredients').select('*').order('name');
  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: tags } = await supabase.from('tags').select('*').order('name'); // <-- NUEVO

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-neutral-900">Nueva Receta</h1>
        
        <Link 
          href="/admin/administrar" 
          className="bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2 shadow-sm"
        >
          ⚙️ Administrar Recetas
        </Link>
      </div>
      
      {/* Pasamos las categorías y etiquetas al formulario */}
      <FormularioReceta 
        units={units || []} 
        ingredients={ingredients || []} 
        categories={categories || []} 
        tags={tags || []} // <-- NUEVO
      />
    </div>
  );
}