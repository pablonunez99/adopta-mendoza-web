import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Heart, Search, HandHeart, Mail, ArrowRight, PawPrint } from 'lucide-react';

// Reusing types for the preview section
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
    name: string;
  } | null;
};

// Fetch limited animals for the landing page
async function getFeaturedAnimals(): Promise<Animal[]> {
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
    .eq('status', 'adoptable')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error cargando animales:', error);
    return [];
  }

  return (data || []) as unknown as Animal[];
}

export default async function LandingPage() {
  const featuredAnimals = await getFeaturedAnimals();

  return (
    <div className="flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center py-20 bg-gray-50 dark:bg-[#111] overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 w-full">
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Encontrá a tu <br/>
              <span className="text-primary">compañero ideal</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto md:mx-0">
              Miles de animales esperan una segunda oportunidad. 
              Adoptar es un acto de amor que cambia vidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/adopta" className="bg-primary hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Adoptar Ahora
              </Link>
              <Link href="/encontra" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold py-4 px-8 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Reportar Perdido
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-64 md:h-[500px] bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
               <PawPrint className="w-32 h-32 opacity-20" />
             </div>
             <img 
               src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" 
               alt="Happy dog" 
               className="object-cover w-full h-full opacity-80"
             />
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-0 transform -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Featured Pets (Adopta Preview) */}
      <section id="adopta" className="min-h-screen flex items-center py-20 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-4 w-full">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold uppercase tracking-wider text-sm">Adopta</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                Esperando un hogar
              </h2>
            </div>
            <Link href="/adopta" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline">
              Ver todos <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredAnimals.map((animal) => (
              <Link href={`/mascotas/${animal.id}`} key={animal.id} className="group">
                <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-800">
                  <div className="relative h-64 overflow-hidden">
                     {animal.photos && animal.photos.length > 0 ? (
                      <img 
                        src={animal.photos[0]} 
                        alt={animal.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                     ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">Sin Foto</div>
                     )}
                     <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                       {animal.age_approx}
                     </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{animal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{animal.breed}</p>
                    <div className="mt-auto flex justify-between items-center">
                       <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                         {animal.sex === 'male' ? 'Macho' : animal.sex === 'female' ? 'Hembra' : 'Desconocido'}
                       </span>
                       <span className="text-primary text-sm font-bold">Adoptar</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/adopta" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Ver todas las mascotas <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Encontrá Section Banner */}
      <section id="encontra" className="min-h-screen flex items-center py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center w-full">
          <Search className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Perdiste o encontraste una mascota?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Ayudamos a reunir familias. Publicá una alerta o buscá entre las mascotas reportadas recientemente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">
               Buscar Mascota
             </button>
             <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
               Publicar Alerta
             </button>
          </div>
        </div>
      </section>

      {/* Doná Section */}
      <section id="dona" className="min-h-screen flex items-center py-20 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4 w-full">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 md:p-16 shadow-xl flex flex-col md:flex-row items-center gap-12 border border-gray-100 dark:border-gray-800 w-full">
            <div className="flex-1">
              <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-full text-sm mb-4 inline-block">Colaborá</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Tu ayuda hace la diferencia
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Somos una organización sin fines de lucro. Tu donación nos ayuda a cubrir gastos veterinarios, alimento y refugio temporal para cientos de animales.
              </p>
              <button className="bg-primary hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all flex items-center gap-2">
                <HandHeart className="w-5 h-5" />
                Donar Ahora
              </button>
            </div>
            <div className="flex-1 flex justify-center w-full">
               <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-bold">Alias MercadoPago</p>
                  <p className="text-2xl font-mono font-bold text-gray-800 dark:text-white select-all cursor-pointer hover:text-primary transition-colors">
                    adopta.mendoza.mp
                  </p>
                  <p className="text-xs text-gray-400 mt-4">Haz clic para copiar</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="min-h-screen flex items-center py-20 bg-gray-50 dark:bg-[#111]">
        <div className="container mx-auto px-4 text-center w-full">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Contáctanos</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-400">contacto@adoptamendoza.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
           <p className="text-gray-500 dark:text-gray-400">
             © {new Date().getFullYear()} AdoptaMendoza. Hecho con ❤️ para los animales.
           </p>
        </div>
      </footer>
    </div>
  );
}