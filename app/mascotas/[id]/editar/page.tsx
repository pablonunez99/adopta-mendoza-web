'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import { Loader2, Save, PawPrint, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LocationPicker from '@/components/LocationPicker';

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = use(params);
  
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [petStatus, setPetStatus] = useState<string>('adoptable');

  // Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  
  // Age split
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  
  const [size, setSize] = useState('medium');
  const [sex, setSex] = useState('unknown');
  const [description, setDescription] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Lost Pet specific
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error('Debes iniciar sesión.');
        router.push('/login');
      } else {
        fetchPetData();
      }
    }
  }, [user, isLoading, router, id]);

  const fetchPetData = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Mascota no encontrada');

      // Security check: only owner can edit
      if (data.owner_id !== user?.id) {
         toast.error('No tienes permiso para editar esta publicación.');
         router.push('/');
         return;
      }

      // Populate Form
      setName(data.name || '');
      setSpecies(data.species || 'dog');
      setBreed(data.breed || '');
      setSex(data.sex || 'unknown');
      setSize(data.size || 'medium');
      setDescription(data.description || '');
      setMedicalNotes(data.medical_notes || '');
      setPetStatus(data.status || 'adoptable');
      
      if (data.photos && data.photos.length > 0) {
        setPhotoUrl(data.photos[0]);
      }

      if (data.last_seen_lat && data.last_seen_long) {
        setLocation({ lat: data.last_seen_lat, lng: data.last_seen_long });
      }

      // Parse Age String (Primitive heuristic)
      if (data.age_approx) {
         const yearsMatch = data.age_approx.match(/(\d+)\s*año/);
         const monthsMatch = data.age_approx.match(/(\d+)\s*mes/);
         if (yearsMatch) setAgeYears(yearsMatch[1]);
         if (monthsMatch) setAgeMonths(monthsMatch[1]);
      }

    } catch (error: any) {
      console.error('Error fetching pet:', error);
      toast.error('Error cargando datos de la mascota.');
      router.push('/perfil');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    // Reconstruct age string
    let ageString = '';
    const years = parseInt(ageYears) || 0;
    const months = parseInt(ageMonths) || 0;

    if (years > 0) ageString += `${years} año${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (ageString) ageString += ', ';
      ageString += `${months} mes${months > 1 ? 'es' : ''}`;
    }
    if (!ageString && petStatus === 'adoptable') ageString = 'Desconocida';

    const updates: any = {
      name,
      species,
      breed,
      sex,
      size,
      description,
      medical_notes: medicalNotes,
      age_approx: ageString,
    };

    if (photoUrl) {
      updates.photos = [photoUrl];
    }

    if (location) {
      updates.last_seen_lat = location.lat;
      updates.last_seen_long = location.lng;
    }

    try {
      const { error } = await supabase
        .from('animals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('¡Publicación actualizada!');
      router.push('/perfil'); // Return to dashboard
    } catch (error: any) {
      console.error('Error updating pet:', error);
      toast.error(error.message || 'Error al actualizar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isLostPet = petStatus === 'lost' || petStatus === 'found';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        
        <Link href="/perfil" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver al Perfil
        </Link>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
          <PawPrint className="w-8 h-8 text-primary" />
          Editar Publicación
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
          
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Especie</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raza</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexo</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="unknown">Desconocido</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
            </div>
          </div>

          {/* Adoption Specific Fields */}
          {!isLostPet && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edad Aprox.</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        placeholder="Años"
                        value={ageYears}
                        onChange={(e) => setAgeYears(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">Años</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        placeholder="Meses"
                        value={ageMonths}
                        onChange={(e) => setAgeMonths(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">Meses</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tamaño</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
              placeholder="Cuenta su historia, personalidad, detalles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {!isLostPet && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas Médicas (Opcional)</label>
              <textarea
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                placeholder="Vacunas, castración, tratamientos..."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
              />
            </div>
          )}

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Principal</label>
            <div className="mb-4">
               {photoUrl && (
                 <img src={photoUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
               )}
            </div>
            <ImageUploader onUpload={setPhotoUrl} bucketName="animals" />
          </div>
          
          {/* Lost Pet Location Editing */}
          {isLostPet && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación (Si deseas cambiarla)</label>
              <div className="h-64 md:h-80 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                 <LocationPicker 
                   apiKey={process.env.GOOGLE_MAPS_API_KEY || ''} 
                   onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                 />
              </div>
              {location && (
                <p className="text-xs text-gray-500 mt-1">
                  Nueva ubicación seleccionada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
               <>
                 <Save className="w-5 h-5" /> Guardar Cambios
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}