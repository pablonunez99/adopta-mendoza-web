'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

export default function AdoptionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // State for filters
  const [species, setSpecies] = useState(searchParams.get('species') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [sex, setSex] = useState(searchParams.get('sex') || '');
  const [age, setAge] = useState(searchParams.get('age') || '');

  // Debounced update for filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (species) params.set('species', species);
    if (size) params.set('size', size);
    if (sex) params.set('sex', sex);
    if (age) params.set('age', age);
    
    // Push updates to URL without full reload (shallow routing logic handled by Next.js app router implicitly)
    // We replace so we don't build huge history stack
    router.replace(`/adopta?${params.toString()}`, { scroll: false });
  }, [species, size, sex, age, router]);

  const clearFilters = () => {
    setSpecies('');
    setSize('');
    setSex('');
    setAge('');
    router.replace('/adopta', { scroll: false });
  };

  const hasFilters = species || size || sex || age;

  return (
    <div className="mb-8">
      {/* Mobile Toggle */}
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg font-bold text-sm shadow-sm"
        >
          <Filter className="w-4 h-4" />
          {isOpen ? 'Ocultar Filtros' : 'Filtrar Mascotas'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block bg-white dark:bg-[#151515] p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-all`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            
            {/* Especie */}
            <select 
              value={species} 
              onChange={(e) => setSpecies(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Todas las Especies</option>
              <option value="dog">Perros</option>
              <option value="cat">Gatos</option>
              <option value="other">Otros</option>
            </select>

            {/* Sexo */}
            <select 
              value={sex} 
              onChange={(e) => setSex(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Cualquier Sexo</option>
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>

            {/* Tamaño */}
            <select 
              value={size} 
              onChange={(e) => setSize(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Cualquier Tamaño</option>
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>

          {hasFilters && (
            <button 
              onClick={clearFilters}
              className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <X className="w-4 h-4" /> Limpiar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}