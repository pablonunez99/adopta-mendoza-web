import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

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

// Esta función se ejecuta en el servidor (Server Component)
// ¡Es super rápido y Google lo ama!
async function getAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
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
    `)
    .eq('status', 'adoptable') // Misma lógica que en tu app
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando animales:', error);
    return [];
  }

  return (data || []) as unknown as Animal[]; 
}

function traducirTamano(size: string) {
  if (size === 'small' || size?.includes('peque')) return 'Pequeño';
  if (size === 'large' || size?.includes('grande')) return 'Grande';
  return 'Mediano';
}

function traducirSexo(sex: string) {
  if (sex === 'male') return 'Macho';
  if (sex === 'female') return 'Hembra';
  return 'Desconocido';
}

export default async function AdoptaPage() {
  const animals = await getAnimals();

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      {/* Grid de Mascotas */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          Amigos esperando un hogar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {animals.map((animal) => (
            <Link href={`/mascotas/${animal.id}`} key={animal.id} >
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                {/* Imagen */}
                <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800">
                  {animal.photos && animal.photos.length > 0 ? (
                    <img 
                      src={animal.photos[0]} 
                      alt={animal.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Sin foto
                    </div>
                  )}
                  {/* Badge de Refugio */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    📍 {animal.shelters?.name || 'Refugio'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{animal.name}</h3>
                    {animal.sex === 'male' ? (
                      <span className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full text-xs" title="Macho">♂</span>
                    ) : animal.sex === 'female' ? (
                      <span className="text-pink-500 bg-pink-100 dark:bg-pink-900/30 p-1 rounded-full text-xs" title="Hembra">♀</span>
                    ) : null}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{animal.breed}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{animal.age_approx}</span>
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{traducirTamano(animal.size)}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      {animal.status === 'adoptable' ? 'En Adopción' : 'Reservado'}
                    </span>
                    <span className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1">
                      Ver Detalles <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}