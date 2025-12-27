import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import AdoptionFilters from '@/components/AdoptionFilters';
import FavoriteButton from '@/components/FavoriteButton';

// Definimos el tipo (Similar a tu modelo en Dart)
type Animal = {
  id: string;
  name: string;
  breed: string;
  photos: string[];
  status: 'adoptable' | 'adopted' | 'reserved';
  age_approx: string;
  size: string;
  sex: string;
  shelters: {
    name: string; // Accedemos al nombre del refugio por relación
  } | null;
};

const ITEMS_PER_PAGE = 8;

// Esta función se ejecuta en el servidor (Server Component)
async function getAnimals(searchParams: { [key: string]: string | string[] | undefined }): Promise<{ animals: Animal[], count: number }> {
  const page = parseInt(searchParams.page as string || '1');
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('animals')
    .select(`
      id, 
      name, 
      breed, 
      photos, 
      status,
      age_approx,
      size,
      sex,
      shelters ( name ) 
    `, { count: 'exact' })
    .eq('status', 'adoptable');

  // Aplicar Filtros Dinámicamente
  if (searchParams.species) query = query.eq('species', searchParams.species);
  if (searchParams.sex) query = query.eq('sex', searchParams.sex);
  if (searchParams.size) query = query.eq('size', searchParams.size);

  // Ordenar y Rango
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error cargando animales:', error);
    return { animals: [], count: 0 };
  }

  return { 
    animals: (data || []) as unknown as Animal[], 
    count: count || 0 
  }; 
}

// ... (helpers remain same)

export default async function AdoptaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const { animals, count } = await getAnimals(params);
  
  const currentPage = parseInt(params.page as string || '1');
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          Amigos esperando un hogar
        </h2>

        <AdoptionFilters />

        {animals.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#151515] rounded-3xl border border-gray-100 dark:border-gray-800">
             <p className="text-xl text-gray-500 font-medium">No se encontraron mascotas 😢</p>
             <Link href="/adopta" className="text-primary font-bold mt-4 inline-block hover:underline">
               Limpiar filtros
             </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {animals.map((animal) => (
                <Link href={`/mascotas/${animal.id}`} key={animal.id} >
                  {/* ... (card content remains same) */}
                                  <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                                    <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800">
                                      <div className="absolute top-2 right-2 z-10">
                                        <FavoriteButton animalId={animal.id} />
                                      </div>
                                      {animal.photos && animal.photos.length > 0 ? (                        <img 
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
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{animal.name}</h3>
                        {animal.sex === 'male' ? (
                          <span className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full text-xs">♂</span>
                        ) : animal.sex === 'female' ? (
                          <span className="text-pink-500 bg-pink-100 dark:bg-pink-900/30 p-1 rounded-full text-xs">♀</span>
                        ) : null}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{animal.breed}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{animal.age_approx}</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{traducirTamano(animal.size)}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide">En Adopción</span>
                        <span className="text-red-500 font-bold text-sm">Ver Detalles →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <Link 
                  href={`/adopta?${new URLSearchParams({...params as any, page: (currentPage - 1).toString()})}`}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPage <= 1 ? 'pointer-events-none opacity-30' : 'bg-white dark:bg-gray-800 hover:bg-gray-100'}`}
                >
                  Anterior
                </Link>
                <span className="text-sm font-medium text-gray-500">
                  Página {currentPage} de {totalPages}
                </span>
                <Link 
                  href={`/adopta?${new URLSearchParams({...params as any, page: (currentPage + 1).toString()})}`}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${currentPage >= totalPages ? 'pointer-events-none opacity-30' : 'bg-white dark:bg-gray-800 hover:bg-gray-100'}`}
                >
                  Siguiente
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button for Adding Pet */}
      <div className="fixed bottom-8 right-8 z-20">
        <Link 
          href="/adopta/nueva"
          className="bg-primary hover:bg-red-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
          Publicar Mascota
        </Link>
      </div>
    </main>
  );
}