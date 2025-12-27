'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';

interface PetImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function PetImage({ src, alt, className }: PetImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 ${className}`}>
        <PawPrint className="w-10 h-10 mb-2 opacity-20" />
        <span className="text-xs font-medium opacity-50">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}