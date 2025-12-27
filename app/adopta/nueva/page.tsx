'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import { Loader2, Save, PawPrint } from 'lucide-react';

export default function AddPetPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [size, setSize] = useState('medium');
  const [sex, setSex] = useState('unknown');
  const [description, setDescription] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Debes iniciar sesión para publicar una mascota.');
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

    setSubmitting(true);

    // Construct age string
    let ageString = '';
    const years = parseInt(ageYears) || 0;
    const months = parseInt(ageMonths) || 0;

    if (years > 0) ageString += `${years} año${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (ageString) ageString += ', ';
      ageString += `${months} mes${months > 1 ? 'es' : ''}`;
    }
    if (!ageString) ageString = 'Desconocida';

    try {
      const { error } = await supabase.from('animals').insert([
        {
          name,
          species,
          breed,
          sex,
          age_approx: ageString,
          size,
          description,
          medical_notes: medicalNotes,
          status: 'adoptable',
          photos: [photoUrl],
          // shelter_id: we'd ideally fetch the user's shelter here
        },
      ]);

      if (error) throw error;

      toast.success('¡Mascota publicada para adopción!');
      router.push('/adopta');
    } catch (error: any) {
      console.error('Error creating pet:', error);
      toast.error(error.message || 'Error al publicar mascota.');
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
          <PawPrint className="w-8 h-8 text-primary" />
          Publicar Mascota en Adopción
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
          
          {/* Basic Info */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
              placeholder="Cuenta su historia, personalidad, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

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

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Principal</label>
            <ImageUploader onUpload={setPhotoUrl} bucketName="animals" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publicar Mascota'}
          </button>
        </form>
      </div>
    </div>
  );
}