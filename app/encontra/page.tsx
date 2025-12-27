import { supabase } from '@/lib/supabaseClient';
import LostPetsMap from '@/components/LostPetsMap';
import { Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getLostPets() {
  // Fetch animals with status 'lost' OR 'found' (sightings). 
  const { data, error } = await supabase
    .from('animals')
    .select('id, name, last_seen_lat, last_seen_long, photos, description, species, status')
    .in('status', ['lost', 'found']) // Fetch both types
    .not('last_seen_lat', 'is', null)
    .not('last_seen_long', 'is', null);

  if (error) {
    console.error('Error fetching lost pets:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export default async function EncontraPage() {
  const lostPets = await getLostPets();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* Header Section */}
      <section className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center justify-center gap-3">
            <Search className="w-10 h-10 text-primary" />
            Buscador de Mascotas
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mapa en tiempo real de mascotas perdidas y avistamientos recientes.
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="flex-grow relative h-[calc(100vh-200px)] min-h-[500px] w-full bg-gray-100 dark:bg-gray-800">
        {!apiKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Falta configuración</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Para ver el mapa, necesitas configurar la variable de entorno <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
            </p>
          </div>
        ) : (
          <LostPetsMap pets={lostPets} apiKey={apiKey} />
        )}
      </section>

      {/* Action Buttons */}
      <div className="fixed bottom-8 right-8 z-20 flex flex-col gap-4 items-end">
        <Link 
          href="/encontra/avistamiento"
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold py-3 px-6 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Search className="w-5 h-5 text-blue-500" />
          Vi una mascota
        </Link>
        
        <Link 
          href="/encontra/reportar"
          className="bg-primary hover:bg-red-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <AlertTriangle className="w-5 h-5" />
          Perdí mi mascota
        </Link>
      </div>

    </div>
  );
}