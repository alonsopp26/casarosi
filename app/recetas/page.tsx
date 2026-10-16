import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import FavoriteButton from '@/components/FavoriteButton'

export const dynamic = 'force-dynamic';

export default async function RecetasPage({ searchParams }: { searchParams: Promise<{ q?: string; fav?: string }> }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const favIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', user.id);
    
    favs?.forEach((f) => favIds.add(f.recipe_id));
  }

  // 1. Extraemos la búsqueda y el filtro de favoritos de la URL
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || '';
  const soloFavoritos = resolvedParams?.fav === 'true';
  
  let recipeIdsToFetch: string[] = [];

  // 2. Si hay una búsqueda por texto/tag
  if (searchQuery) {
    const ids = new Set<string>();

    const { data: textMatches } = await supabase
      .from('recipes')
      .select('id')
      .eq('status', 'published')
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

    textMatches?.forEach((r) => ids.add(r.id));

    const { data: tagMatches } = await supabase
      .from('recipe_tags')
      .select('recipe_id, tags!inner(name)')
      .ilike('tags.name', `%${searchQuery}%`);

    tagMatches?.forEach((r) => ids.add(r.recipe_id));
    
    recipeIdsToFetch = Array.from(ids);
  }
  
  // 3. Preparamos la consulta final
  let query = supabase
    .from('recipes')
    .select(`
      *,
      categories ( name ),
      recipe_tags (
        tags ( name )
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (searchQuery) {
    if (recipeIdsToFetch.length > 0) {
      query = query.in('id', recipeIdsToFetch);
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

  // 4. Si hicieron clic en el corazón del Navbar (?fav=true), filtramos solo sus favoritos
  if (soloFavoritos) {
    const listaFavs = Array.from(favIds);
    if (listaFavs.length > 0) {
      query = query.in('id', listaFavs);
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

  const { data: recipes, error } = await query;

  if (error) {
    console.error('Error cargando recetas:', error);
  }

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white transition-colors">
              {soloFavoritos
                ? ' Mis Recetas Favoritas'
                : searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Catálogo de Recetas'}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 transition-colors">
              {soloFavoritos
                ? 'Tus platillos guardados para cocinar cuando quieras'
                : searchQuery
                ? 'Explora las opciones que encontramos para ti'
                : 'Explora los mejores platillos creados en La Casa de Rosi'}
            </p>
          </div>
          
          {(searchQuery || soloFavoritos) && (
            <Link href="/recetas" className="text-orange-500 font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              ✕ Ver todas las recetas
            </Link>
          )}
        </div>
        
        {/* ESTADO VACÍO */}
        {!recipes || recipes.length === 0 ? (
          <div className="bg-[#fbf8f3] dark:bg-stone-900 p-12 rounded-2xl border border-amber-200/60 dark:border-stone-800 text-center shadow-sm transition-colors">
            <p className="text-4xl mb-3">{soloFavoritos ? '💔' : '🍳'}</p>
            <p className="text-stone-700 dark:text-stone-300 font-medium text-lg">
              {soloFavoritos
                ? 'Aún no tienes recetas guardadas en favoritos.'
                : searchQuery
                ? `No encontramos ninguna receta que coincida con "${searchQuery}".`
                : 'Aún no hay recetas publicadas.'}
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
              {soloFavoritos
                ? 'Explora el catálogo y toca el corazón en las recetas que más te gusten.'
                : 'Intenta buscar con otra palabra o ingrediente.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => {
              const badgeTexto = recipe.difficulty || recipe.categories?.name || 'Fácil';
              const calificacion = recipe.rating || '4.8';
              const esFavorito = favIds.has(recipe.id);

              return (
                <div 
                  key={recipe.id} 
                  className="bg-[#fbf8f3] dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-amber-200/60 dark:border-stone-800 hover:shadow-md transition-all group flex flex-col"
                >
                  <Link href={`/recetas/${recipe.id}`} className="w-full h-52 overflow-hidden relative block bg-stone-200 dark:bg-stone-800">
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                        🍳
                      </div>
                    )}
                    
                    <span className="absolute top-3 right-3 bg-[#ff7a00] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-sm">
                      {badgeTexto}
                    </span>
                  </Link>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/recetas/${recipe.id}`}>
                      <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1">
                        {recipe.title}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-stone-500 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.prep_time_minutes} min</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#ff7a00] fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="font-medium text-stone-600 dark:text-stone-300">{calificacion}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Link 
                        href={`/recetas/${recipe.id}`}
                        className="inline-flex items-center justify-center bg-gradient-to-r from-[#ff3d77] to-[#ff6a00] hover:opacity-90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-opacity"
                      >
                        Ver receta
                      </Link>
                      
                      <FavoriteButton 
                        recipeId={recipe.id} 
                        initialIsFavorite={esFavorito} 
                        userId={user?.id} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}