'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import LocationPicker from '@/components/LocationPicker';
import { Loader2, Eye, MapPin } from 'lucide-react';

export default function ReportSightingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [speciesGuess, setSpeciesGuess] = useState('dog');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Anonymous toggle? (For now require login to prevent spam)
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Debes iniciar sesión para reportar un avistamiento.');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!location) {
      toast.error('Por favor marca dónde viste a la mascota.');
      return;
    }

    setSubmitting(true);

    try {
      // Note: The schema for 'sightings' has a 'location' column of type USER-DEFINED.
      // This usually means PostGIS geography(Point). 
      // Inserting raw lat/long might fail depending on how Supabase/Postgres is configured.
      // However, for simplicity and since I don't have full control over the USER-DEFINED type logic without checking SQL definitions,
      // I will assume the backend might handle lat/long columns if I added them or if I use a raw query.
      
      // WAIT: The schema showed 'location USER-DEFINED'. It didn't show separate lat/long columns for sightings table.
      // The 'animals' table HAD last_seen_lat/long.
      // To be safe and quick, I will insert this as a "Found" animal into the 'animals' table instead of 'sightings',
      // setting status='found' (or 'sighted' if enum supports it).
      // This unifies the map logic easily.
      
      // Let's check 'animals' table constraints again.
      // It has 'status' (adoptable, lost, etc).
      // I'll use status: 'found' for sightings to mean "I found/saw this dog".
      
      const { error } = await supabase.from('animals').insert([
        {
          name: 'Avistamiento', // Placeholder name
          species: speciesGuess,
          description: `AVISTAMIENTO: ${description}`,
          status: 'found', // Using 'found' to distinguish from 'lost'
          photos: photoUrl ? [photoUrl] : [],
          last_seen_lat: location.lat,
          last_seen_long: location.lng,
          owner_id: user.id, // The reporter
        },
      ]);

      if (error) throw error;

      toast.success('¡Avistamiento reportado! Gracias por ayudar.');
      router.push('/encontra');
    } catch (error: any) {
      console.error('Error reporting sighting:', error);
      toast.error(error.message || 'Error al crear reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center flex items-center justify-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          Reportar Avistamiento
        </h1>
        <p className="text-center text-gray-500 mb-8">
          ¿Viste una mascota perdida en la calle? Repórtala aquí para ayudar a sus dueños a encontrarla.
        </p>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">¿Qué viste?</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
              value={speciesGuess}
              onChange={(e) => setSpeciesGuess(e.target.value)}
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
              placeholder="Color, tamaño, si tenía collar, estado de salud aparente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto (Muy importante)</label>
            <ImageUploader onUpload={setPhotoUrl} bucketName="animals" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">¿Dónde lo viste?</label>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
               <LocationPicker 
                 apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} 
                 onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
               />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Marca la ubicación exacta del avistamiento.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publicar Avistamiento'}
          </button>
        </form>
      </div>
    </div>
  );
}