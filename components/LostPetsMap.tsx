'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { Loader2, Dog } from 'lucide-react';
import { useTheme } from 'next-themes';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

// Coordenadas del centro de Mendoza, Argentina
const center = {
  lat: -32.8895,
  lng: -68.8458,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

type LostPet = {
  id: string;
  name: string;
  last_seen_lat: number;
  last_seen_long: number;
  photos: string[];
  description: string;
  species: string;
  status: string;
};

interface LostPetsMapProps {
  pets: LostPet[];
  apiKey: string;
}

export default function LostPetsMap({ pets, apiKey }: LostPetsMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null);
  const { resolvedTheme } = useTheme();

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new google.maps.LatLngBounds(center);
    
    // Si hay mascotas, ajustamos el mapa para que se vean todas
    if (pets.length > 0) {
      pets.forEach((pet) => {
        if (pet.last_seen_lat && pet.last_seen_long) {
          bounds.extend({ lat: pet.last_seen_lat, lng: pet.last_seen_long });
        }
      });
      // Don't zoom in too close if there's only one point
      if (pets.length > 1) {
         map.fitBounds(bounds);
      } else {
         map.setCenter({ lat: pets[0].last_seen_lat, lng: pets[0].last_seen_long });
         map.setZoom(14);
      }
    } else {
      map.setZoom(12);
    }

    setMap(map);
  }, [pets]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Cargando mapa...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: resolvedTheme === 'dark' ? darkMapStyle : [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }}
    >
      {pets.map((pet) => (
        <OverlayView
          key={pet.id}
          position={{ lat: pet.last_seen_lat, lng: pet.last_seen_long }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div 
            onClick={() => setSelectedPet(pet)}
            className="cursor-pointer transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform duration-200 relative group"
          >
            {/* Pin Shape container */}
            <div className={`w-12 h-12 rounded-full border-4 shadow-lg overflow-hidden bg-gray-200 relative z-10 ${
              pet.status === 'found' ? 'border-blue-500' : 'border-[#fb3c46]'
            }`}>
               {pet.photos && pet.photos[0] ? (
                 <img 
                   src={pet.photos[0]} 
                   alt={pet.name} 
                   className="w-full h-full object-cover" 
                 />
               ) : (
                 <div className={`w-full h-full flex items-center justify-center text-white ${
                    pet.status === 'found' ? 'bg-blue-500' : 'bg-[#fb3c46]'
                 }`}>
                   <Dog className="w-6 h-6" />
                 </div>
               )}
            </div>
            {/* Triangle/Pointer at bottom */}
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] ${
              pet.status === 'found' ? 'border-t-blue-500' : 'border-t-[#fb3c46]'
            }`}></div>
          </div>
        </OverlayView>
      ))}

      {selectedPet && (
        <InfoWindow
          position={{ lat: selectedPet.last_seen_lat, lng: selectedPet.last_seen_long }}
          onCloseClick={() => setSelectedPet(null)}
          options={{
             pixelOffset: new google.maps.Size(0, -50) // Offset InfoWindow to appear above the custom marker
          }}
        >
          <div className="p-2 max-w-xs text-gray-900">
            <div className="relative h-32 w-48 mb-2 rounded-md overflow-hidden bg-gray-200">
               {selectedPet.photos && selectedPet.photos[0] ? (
                 <img
                   src={selectedPet.photos[0]}
                   alt={selectedPet.name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="flex items-center justify-center h-full text-xs text-gray-500">Sin foto</div>
               )}
            </div>
            <h3 className="font-bold text-lg mb-1">{selectedPet.name}</h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{selectedPet.description}</p>
            <Link 
              href={`/mascotas/${selectedPet.id}`}
              className="block w-full text-center bg-[#fb3c46] text-white text-sm font-bold py-1 px-2 rounded hover:bg-red-600 transition-colors"
            >
              Ver Detalles
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}