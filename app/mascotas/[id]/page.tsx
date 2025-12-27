// app/mascota/[id]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Mascota {
  id: string;
  name: string;
  species: string;
  breed: string;
  age_approx: string;
  size: string;
  description: string;
  status: 'adoptable' | 'adopted' | 'reserved';
  photos: string[];
  medical_notes: string;
  sex: 'male' | 'female' | 'unknown';
  owner_id?: string; // ID del usuario si es un particular
  shelters: {
    name: string;
    phone: string;
    website?: string;
    address?: string;
  } | null;
  // Info del dueño si no es refugio
  owner?: {
    full_name: string;
    phone: string;
    email: string;
  } | null;
}

// 1. Función para obtener la MASCOTA por ID
async function getMascota(id: string): Promise<Mascota | null> {
  const { data, error } = await supabase
    .from('animals') 
    .select(`
      *,
      shelters (
        name,
        phone,
        website,
        address
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const mascota = data as Mascota;

  // Si tiene owner_id y no es de un refugio (o prefieres mostrar data del usuario)
  // buscamos el perfil del usuario.
  if (mascota.owner_id && !mascota.shelters) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', mascota.owner_id)
      .single();
    
    if (profile) {
      mascota.owner = profile;
    }
  }

  return mascota;
}

// 2. Componente de Página
export default async function MascotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mascota = await getMascota(id);

  if (!mascota) {
    notFound();
  }

  // Lógica de contacto
  // Prioridad: Refugio > Dueño > Default
  const contactName = mascota.shelters?.name || mascota.owner?.full_name || 'Anunciante';
  const contactPhone = mascota.shelters?.phone || mascota.owner?.phone || '549261000000';
  
  const mensajeWhatsapp = `Hola, estoy interesado en adoptar a ${mascota.name} que vi en AdoptaMendoza Web.`;
  const linkWhatsapp = `https://wa.me/${contactPhone}?text=${encodeURIComponent(mensajeWhatsapp)}`;

  return (
    <main className="min-h-screen bg-background pb-12 transition-colors duration-300">
      {/* Botón Volver */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center gap-2 transition-colors font-medium">
          ← Volver al listado
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
          
          {/* SECCIÓN 1: Galería de Fotos */}
          <div className="w-full bg-gray-100 dark:bg-gray-800">
            {!mascota.photos || mascota.photos.length === 0 ? (
               <div className="h-96 w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400">
                 Sin Foto
               </div>
            ) : (
              <div className={`grid gap-1 ${
                mascota.photos.length === 1 ? 'grid-cols-1' :
                mascota.photos.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-4 md:grid-rows-2'
              } h-[400px] md:h-[500px]`}>
                
                {/* Primera imagen (Hero) */}
                <div className={`relative overflow-hidden ${
                  mascota.photos.length === 1 ? 'h-full' :
                  mascota.photos.length === 2 ? 'h-full' :
                  'md:col-span-2 md:row-span-2'
                }`}>
                  <img 
                    src={mascota.photos[0]} 
                    alt={`${mascota.name} principal`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Resto de imágenes (hasta 4 más) */}
                {mascota.photos.slice(1, 5).map((foto, index) => (
                   <div key={index} className="relative overflow-hidden hidden md:block">
                     <img 
                       src={foto} 
                       alt={`${mascota.name} - foto ${index + 2}`} 
                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: Información de la Mascota */}
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{mascota.name}</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">{mascota.species} • {mascota.breed}</p>
              </div>
              
              {mascota.status !== 'adoptable' && (
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full font-bold">
                  {mascota.status === 'adopted' ? '¡Adoptado!' : 'Reservado'}
                </span>
              )}
            </div>

            {/* Chips de Detalles */}
            <div className="flex flex-wrap gap-3 mb-8">
              <DetailChip label={mascota.age_approx} icon="🎂" color="blue" />
              <DetailChip label={traducirTamano(mascota.size)} icon="📏" color="purple" />
              <DetailChip label={traducirSexo(mascota.sex)} icon="⚧" color="pink" />
            </div>

            <hr className="border-gray-100 dark:border-gray-800 my-8" />

            {/* Historia */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Conoce su historia</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                {mascota.description}
              </p>
            </div>

            {/* Notas Médicas */}
            {mascota.medical_notes && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 mb-8 flex gap-4">
                <span className="text-3xl">🩺</span>
                <div>
                  <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-1">Salud</h3>
                  <p className="text-red-700 dark:text-red-300">{mascota.medical_notes}</p>
                </div>
              </div>
            )}

            {/* Refugio y Contacto */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 gap-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-2xl border border-gray-100 dark:border-gray-700">
                  {mascota.shelters ? '🏡' : '👤'}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
                    {mascota.shelters ? 'Estás contactando a' : 'Publicado por'}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">
                    {contactName}
                  </p>
                   {mascota.shelters?.address && (
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{mascota.shelters.address}</p>
                   )}
                   {mascota.shelters?.website && (
                      <a href={mascota.shelters.website} target="_blank" rel="noopener noreferrer" className="text-sm text-red-500 hover:underline">
                        Visitar sitio web
                      </a>
                   )}
                </div>
              </div>

              <a 
                href={linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-200 dark:shadow-none"
              >
                <span>💬</span> Contactar
              </a>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

// --- Helpers para traducir datos (Mismos que en tu app Flutter) ---

function DetailChip({ label, icon, color }: { label: string, icon: string, color: 'blue' | 'purple' | 'pink' }) {
  const colorClasses: Record<'blue' | 'purple' | 'pink', string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-100 dark:border-pink-900/30',
  };

  return (
    <span className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colorClasses[color]} font-semibold text-sm`}>
      <span>{icon}</span>
      {label}
    </span>
  );
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