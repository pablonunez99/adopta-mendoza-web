'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';
import { Loader2, Save } from 'lucide-react';

export default function ReportLostPetPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('unknown');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Debes iniciar sesión para reportar una mascota.');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!photoUrl) {
      toast.error('Por favor sube una foto de la mascota.');
      return;
    }
    if (!location) {
      toast.error('Por favor marca la ubicación en el mapa.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('animals').insert([
        {
          name,
          species,
          breed,
          sex,
          description,
          status: 'lost', // Explicitly setting status to lost
          photos: [photoUrl],
          last_seen_lat: location.lat,
          last_seen_long: location.lng,
          owner_id: user.id,
        },
      ]);

      if (error) throw error;

      toast.success('¡Reporte creado exitosamente!');
      router.push('/encontra');
    } catch (error: any) {
      console.error('Error reporting pet:', error);
      toast.error(error.message || 'Error al crear el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null; // Will redirect in useEffect

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center">Reportar Mascota Perdida</h1>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la Mascota</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                placeholder="Ej. Bobby"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raza (Opcional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                placeholder="Ej. Mestizo"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción / Situación</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
              placeholder="Describe cómo se perdió, características distintivas, collar, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Section 2: Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto</label>
            <ImageUploader onUpload={setPhotoUrl} bucketName="animals" />
          </div>

          {/* Section 3: Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación (Última vez visto)</label>
            <div className="h-64 md:h-80 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
               <LocationPicker 
                 apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} 
                 onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
               />
            </div>
            {location && (
              <p className="text-xs text-gray-500 mt-1">
                Ubicación seleccionada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" />
                Publicar Reporte
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}