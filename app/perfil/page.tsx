'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  User, 
  Settings, 
  PawPrint, 
  Loader2, 
  Trash2, 
  Edit, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type Animal = {
  id: string;
  name: string;
  breed: string;
  photos: string[];
  status: string;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '', email: '' });
  
  // Settings Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user!.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhone(profileData.phone || '');
      }

      // 2. Fetch User's Animals
      // Note: We are assuming an 'owner_id' column exists. 
      // If the app was using shelter_id for users, we might check that too, 
      // but 'owner_id' is the cleaner approach for citizens.
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('id, name, breed, photos, status, created_at')
        .eq('owner_id', user!.id) 
        .order('created_at', { ascending: false });

      if (animalsData) {
        setAnimals(animalsData as Animal[]);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Sanitización: Solo dejar números
    const cleanPhone = phone.replace(/\D/g, '');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: cleanPhone })
        .eq('id', user!.id);

      if (error) throw error;
      setPhone(cleanPhone);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      toast.error('Error actualizando perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setAnimals(animals.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAnimals(animals.filter(a => a.id !== id));
      toast.success('Publicación eliminada');
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
               {profile.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
             </div>
             <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                 Hola, {profile.full_name || 'Usuario'}
               </h1>
               <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 mt-8">
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
              activeTab === 'listings' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Mis Publicaciones
            {activeTab === 'listings' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
              activeTab === 'settings' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Mis Datos
            {activeTab === 'settings' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {animals.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-gray-800">
                <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tienes publicaciones</h3>
                <p className="text-gray-500 mb-6">¿Encontraste o perdiste una mascota? ¿Das en adopción?</p>
                <div className="flex justify-center gap-4">
                  <Link href="/adopta/nueva" className="text-primary font-bold hover:underline">Publicar Adopción</Link>
                  <Link href="/encontra/reportar" className="text-primary font-bold hover:underline">Reportar Perdido</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {animals.map((animal) => (
                  <div key={animal.id} className="bg-white dark:bg-[#151515] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                       {animal.photos && animal.photos.length > 0 ? (
                         <img src={animal.photos[0]} alt={animal.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">Sin Foto</div>
                       )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{animal.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{animal.breed}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          animal.status === 'adoptable' ? 'bg-green-100 text-green-700' :
                          animal.status === 'lost' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {animal.status === 'adoptable' ? 'En Adopción' : 
                           animal.status === 'lost' ? 'Perdido' : 
                           animal.status === 'adopted' ? 'Adoptado' :
                           animal.status === 'found' ? 'Encontrado' : animal.status}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {/* Actions */}
                        {animal.status === 'adoptable' && (
                           <button 
                             onClick={() => handleUpdateStatus(animal.id, 'adopted')}
                             className="text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-green-100 hover:text-green-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                           >
                             <CheckCircle className="w-3 h-3" /> Marcar Adoptado
                           </button>
                        )}
                        {animal.status === 'lost' && (
                           <button 
                             onClick={() => handleUpdateStatus(animal.id, 'found')}
                             className="text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-green-100 hover:text-green-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                           >
                             <CheckCircle className="w-3 h-3" /> Marcar Encontrado
                           </button>
                        )}
                        
                        <Link 
                           href={`/mascotas/${animal.id}`}
                           className="text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 hover:text-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                           Ver Ficha
                        </Link>

                        <Link 
                           href={`/mascotas/${animal.id}/editar`}
                           className="text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-yellow-100 hover:text-yellow-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                           <Edit className="w-3 h-3" /> Editar
                        </Link>
                        
                        <button 
                           onClick={() => handleDelete(animal.id)}
                           className="text-xs font-bold bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                           <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-[#151515] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Datos de Contacto
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>
                Estos datos se mostrarán en tus publicaciones para que las personas interesadas puedan contactarte directamente.
              </p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 261 ..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}