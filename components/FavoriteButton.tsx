'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorite: boolean;
  userId?: string;
}

export default function FavoriteButton({ recipeId, initialIsFavorite, userId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que al darle al corazón se abra el link si está dentro de uno
    
    if (!userId) {
      alert('Inicia sesión para guardar tus recetas favoritas ❤️');
      return;
    }

    if (cargando) return;
    setCargando(true);

    // Cambio visual instantáneo para que se sienta rápido
    const estadoAnterior = isFav;
    setIsFav(!isFav);

    const supabase = createClient();

    if (estadoAnterior) {
      // Si ya era favorito, lo quitamos
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) setIsFav(estadoAnterior); // Si falla, regresamos el corazón como estaba
    } else {
      // Si no era favorito, lo guardamos
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, recipe_id: recipeId });

      if (error) setIsFav(estadoAnterior);
    }

    setCargando(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={cargando}
      aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`p-2 transition-transform active:scale-125 cursor-pointer ${
        isFav 
          ? 'text-[#ff3d77]' 
          : 'text-stone-700 dark:text-stone-300 hover:text-[#ff3d77] dark:hover:text-[#ff3d77]'
      }`}
    >
      <svg 
        className="w-5 h-5" 
        fill={isFav ? 'currentColor' : 'none'} 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={1.8}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
        />
      </svg>
    </button>
  );
}