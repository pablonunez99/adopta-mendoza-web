import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Heart, PartyPopper, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Animal = {
  id: string;
  name: string;
  breed: string;
  photos: string[];
  status: string;
  shelters: {
    name: string;
  } | null;
};

async function getAdoptedAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      id, 
      name, 
      breed, 
      photos, 
      status,
      shelters ( name ) 
    `)
    .eq('status', 'adopted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching adopted animals:', error);
    return [];
  }

  return (data || []) as unknown as Animal[];
}

export default async function HistoriasPage() {
  const animals = await getAdoptedAnimals();

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-20 border-b border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Finales <span className="text-primary">Felices</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Cada una de estas fotos representa una vida transformada y una familia que ahora está completa. 
            ¡Gracias por elegir adoptar!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {animals.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#151515] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Próximamente más historias</h3>
            <p className="text-gray-500">Estamos trabajando para reunir todas las fotos de nuestros graduados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {animals.map((animal) => (
              <div key={animal.id} className="group relative bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                
                {/* Image */}
                <div className="relative h-72 w-full overflow-hidden">
                  {animal.photos && animal.photos.length > 0 ? (
                    <img 
                      src={animal.photos[0]} 
                      alt={animal.name}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold">Sin foto</div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-primary flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" /> ADOPTADO
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{animal.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">{animal.breed}</p>
                  
                  <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Un gran cambio gracias a</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-1">
                      {animal.shelters?.name || 'Un Corazón Generoso'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Call to action */}
        <div className="mt-20 text-center bg-primary text-white rounded-3xl p-12 shadow-xl shadow-primary/20">
          <h2 className="text-3xl font-black mb-4">¿Quieres ser parte de estas historias?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Hay cientos de animales esperando hoy mismo su oportunidad de ser felices. 
            Empieza tu proceso de adopción ahora.
          </p>
          <Link href="/adopta" className="bg-white text-primary font-black py-4 px-10 rounded-full hover:scale-105 transition-transform inline-block shadow-lg">
             Adoptar una Mascota
          </Link>
        </div>
      </div>
    </main>
  );
}