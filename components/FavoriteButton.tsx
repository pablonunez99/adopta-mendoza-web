'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function FavoriteButton({ animalId, size = 'default' }: { animalId: string, size?: 'default' | 'large' }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, animalId]);

  const checkFavoriteStatus = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user!.id)
      .eq('animal_id', animalId)
      .single();

    if (data) setIsFavorite(true);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a card
    e.stopPropagation();

    if (!user) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remove
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('animal_id', animalId);
        
        if (error) throw error;
        setIsFavorite(false);
        toast.info('Eliminado de favoritos');
      } else {
        // Add
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, animal_id: animalId }]);
        
        if (error) throw error;
        setIsFavorite(true);
        toast.success('Guardado en favoritos ❤️');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = size === 'large' ? 'p-3' : 'p-2';
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`rounded-full shadow-sm transition-all duration-200 ${buttonSize} ${
        isFavorite 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-white/80 dark:bg-black/50 text-gray-400 hover:text-red-500 hover:bg-white'
      }`}
      title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Heart className={`${iconSize} ${isFavorite ? 'fill-current' : ''} ${loading ? 'animate-pulse' : ''}`} />
    </button>
  );
}