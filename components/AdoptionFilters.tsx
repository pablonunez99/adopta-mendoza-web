'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Check } from 'lucide-react';

export default function AdoptionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // State for filters
  const [species, setSpecies] = useState(searchParams.get('species') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [sex, setSex] = useState(searchParams.get('sex') || '');

  // Debounced update for filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (species) params.set('species', species);
    if (size) params.set('size', size);
    if (sex) params.set('sex', sex);
    
    router.replace(`/adopta?${params.toString()}`, { scroll: false });
  }, [species, size, sex, router]);

  const clearFilters = () => {
    setSpecies('');
    setSize('');
    setSex('');
    router.replace('/adopta', { scroll: false });
  };

  const hasFilters = species || size || sex;

  return (
    <div className="mb-8">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${
            isOpen ? 'bg-primary text-white' : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          {isOpen ? 'Ocultar Filtros' : 'Filtrar Mascotas'}
        </button>
      </div>

      {/* Filter Area */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block transition-all duration-300`}>
        <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-8 w-full">
              
              {/* Filter Group: Species */}
              <FilterGroup label="Especie">
                <FilterPill 
                  label="Todos" 
                  isActive={species === ''} 
                  onClick={() => setSpecies('')} 
                />
                <FilterPill 
                  label="Perros" 
                  isActive={species === 'dog'} 
                  onClick={() => setSpecies('dog')} 
                />
                <FilterPill 
                  label="Gatos" 
                  isActive={species === 'cat'} 
                  onClick={() => setSpecies('cat')} 
                />
              </FilterGroup>

              <div className="w-px bg-gray-200 dark:bg-gray-800 hidden md:block h-8 self-center"></div>

              {/* Filter Group: Sex */}
              <FilterGroup label="Sexo">
                <FilterPill 
                  label="Todos" 
                  isActive={sex === ''} 
                  onClick={() => setSex('')} 
                />
                <FilterPill 
                  label="Machos" 
                  isActive={sex === 'male'} 
                  onClick={() => setSex('male')} 
                />
                <FilterPill 
                  label="Hembras" 
                  isActive={sex === 'female'} 
                  onClick={() => setSex('female')} 
                />
              </FilterGroup>

              <div className="w-px bg-gray-200 dark:bg-gray-800 hidden md:block h-8 self-center"></div>

              {/* Filter Group: Size */}
              <FilterGroup label="Tamaño">
                <FilterPill 
                  label="Todos" 
                  isActive={size === ''} 
                  onClick={() => setSize('')} 
                />
                <FilterPill 
                  label="Pequeño" 
                  isActive={size === 'small'} 
                  onClick={() => setSize('small')} 
                />
                <FilterPill 
                  label="Mediano" 
                  isActive={size === 'medium'} 
                  onClick={() => setSize('medium')} 
                />
                <FilterPill 
                  label="Grande" 
                  isActive={size === 'large'} 
                  onClick={() => setSize('large')} 
                />
              </FilterGroup>

            </div>

            {/* Clear Button */}
            {hasFilters && (
              <button 
                onClick={clearFilters}
                className="mt-4 md:mt-0 text-red-500 text-sm font-bold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1 rounded-full transition-colors self-end md:self-center flex-shrink-0"
              >
                <X className="w-4 h-4" /> Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for better organization

function FilterGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

function FilterPill({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
        isActive 
          ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {isActive && <Check className="w-3 h-3 inline-block mr-1 mb-0.5" />}
      {label}
    </button>
  );
}