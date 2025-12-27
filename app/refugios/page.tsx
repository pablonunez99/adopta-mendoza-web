import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { BadgeCheck, Home, MapPin, Phone, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Shelter = {
  id: string;
  name: string;
  description: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  is_verified: boolean;
};

async function getShelters() {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .order('is_verified', { ascending: false }) // Verified first
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shelters:', error);
    return [];
  }

  return data as Shelter[];
}

export default async function SheltersPage() {
  const shelters = await getShelters();

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Refugios y Hogares</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Conoce a las organizaciones y personas que hacen posible los rescates en Mendoza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shelters.map((shelter) => (
            <Link href={`/refugios/${shelter.id}`} key={shelter.id} className="group">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Home className="w-6 h-6" />
                  </div>
                  {shelter.is_verified && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Verificado
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {shelter.name}
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
                  {shelter.description || 'Sin descripción disponible.'}
                </p>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {shelter.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{shelter.address}</span>
                    </div>
                  )}
                  {shelter.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{shelter.phone}</span>
                    </div>
                  )}
                  {shelter.website && (
                    <div className="flex items-center gap-2 text-primary">
                      <Globe className="w-4 h-4" />
                      <span className="truncate hover:underline">Visitar sitio web</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {shelters.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500">No hay refugios registrados aún.</h3>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}