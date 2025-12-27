'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Heart, Loader2 } from 'lucide-react';
import PetCardSkeleton from '@/components/skeletons/PetCardSkeleton';
import FavoriteButton from '@/components/FavoriteButton';

type Animal = {
  id: string;
  name: string;
  breed: string;
  photos: string[];
  status: string;
  age_approx: string;
  size: string;
  sex: string;
  shelters: {
    name: string;
  } | null;
};

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchFavorites();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          animal_id,
          animals (
            id,
            name,
            breed,
            photos,
            status,
            age_approx,
            size,
            sex,
            shelters ( name )
          )
        `)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Flatten data
      const mappedAnimals = data.map((item: any) => item.animals) as Animal[];
      setFavorites(mappedAnimals);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Inicia sesión para ver tus favoritos</h2>
        <p className="text-gray-500 mb-6">Guarda las mascotas que te interesan para no perderlas de vista.</p>
        <Link href="/login" className="bg-primary text-white font-bold py-3 px-8 rounded-full">
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 transition-colors">
      <div className="container mx-auto">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          Mis Favoritos
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <PetCardSkeleton key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#151515] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
             <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-xl text-gray-500 font-medium">Aún no tienes favoritos guardados.</p>
             <Link href="/adopta" className="text-primary font-bold mt-4 inline-block hover:underline">
               Explorar Mascotas
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {favorites.map((animal) => (
              <Link href={`/mascotas/${animal.id}`} key={animal.id} className="relative group">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800">
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton animalId={animal.id} />
                    </div>
                    {animal.photos && animal.photos.length > 0 ? (
                      <img 
                        src={animal.photos[0]} 
                        alt={animal.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">Sin foto</div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {animal.shelters?.name ? `📍 ${animal.shelters.name}` : '👤 Particular'}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{animal.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{animal.breed}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                       <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
                         animal.status === 'adoptable' 
                           ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                           : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                       }`}>
                         {animal.status === 'adoptable' ? 'En Adopción' : 'Reservado / Adoptado'}
                       </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}