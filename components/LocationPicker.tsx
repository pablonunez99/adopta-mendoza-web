'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

// Center of Mendoza
const defaultCenter = {
  lat: -32.8895,
  lng: -68.8458,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  apiKey: string;
}

export default function LocationPicker({ onLocationSelect, apiKey }: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const { resolvedTheme } = useTheme();

  // Try to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          onLocationSelect(position.coords.latitude, position.coords.longitude);
        },
        () => {
           // Fallback to center if denied
           setMarkerPosition(defaultCenter);
           onLocationSelect(defaultCenter.lat, defaultCenter.lng);
        }
      );
    } else {
        setMarkerPosition(defaultCenter);
        onLocationSelect(defaultCenter.lat, defaultCenter.lng);
    }
  }, []); // Run once

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Cargando mapa...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          styles: resolvedTheme === 'dark' ? darkMapStyle : [],
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {markerPosition && (
          <Marker position={markerPosition} />
        )}
      </GoogleMap>
      <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/80 p-2 rounded shadow text-xs pointer-events-none z-10">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Haz clic para marcar la ubicación</span>
        </div>
      </div>
    </div>
  );
}