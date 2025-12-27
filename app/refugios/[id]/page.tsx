import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin, Phone, Globe, Mail, PawPrint } from 'lucide-react';

type Shelter = {
  id: string;
  name: string;
  description: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  is_verified: boolean;
  // We could fetch manager email if needed via join, but privacy might restrict it
};

type Animal = {
  id: string;
  name: string;
  breed: string;
  photos: string[];
  status: string;
  age_approx: string;
};

async function getShelter(id: string) {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Shelter;
}

async function getShelterAnimals(shelterId: string) {
  const { data, error } = await supabase
    .from('animals')
    .select('id, name, breed, photos, status, age_approx')
    .eq('shelter_id', shelterId)
    .eq('status', 'adoptable');

  if (error) return [];
  return data as Animal[];
}

export default async function ShelterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shelter = await getShelter(id);
  
  if (!shelter) {
    notFound();
  }

  const animals = await getShelterAnimals(id);

  return (
    <main className="min-h-screen bg-background transition-colors duration-300 pb-20">
      
      {/* Header / Cover */}
      <div className="bg-gray-100 dark:bg-[#111] py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg text-primary border-4 border-white dark:border-gray-700">
              <PawPrint className="w-16 h-16" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">{shelter.name}</h1>
                {shelter.is_verified && (
                  <span title="Verificado">
                    <BadgeCheck className="w-8 h-8 text-blue-500" />
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">{shelter.description}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                {shelter.address && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                    <MapPin className="w-4 h-4" /> {shelter.address}
                  </div>
                )}
                {shelter.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                    <Phone className="w-4 h-4" /> {shelter.phone}
                  </div>
                )}
                {shelter.website && (
                  <a href={shelter.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors">
                    <Globe className="w-4 h-4" /> Sitio Web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Pets */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-primary pl-4">
          Mascotas en adopción ({animals.length})
        </h2>

        {animals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animals.map((animal) => (
              <Link href={`/mascotas/${animal.id}`} key={animal.id}>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-800">
                  <div className="relative h-56 overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {animal.photos && animal.photos.length > 0 ? (
                      <img 
                        src={animal.photos[0]} 
                        alt={animal.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">Sin foto</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{animal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{animal.breed} • {animal.age_approx}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">Este refugio no tiene mascotas publicadas actualmente.</p>
          </div>
        )}
      </div>
    </main>
  );
}