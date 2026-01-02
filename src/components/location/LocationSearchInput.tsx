import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationSearchInputProps {
  value: string;
  onChange: (address: string, coordinates: { lat: number; lng: number }) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  coordinates?: { lat: number; lng: number };
}

export function LocationSearchInput({
  value,
  onChange,
  label = "Location",
  placeholder = "Search for your location",
  required = false,
  coordinates,
}: LocationSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');
  const geocodedRef = useRef(false);

  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng && !geocodedRef.current) {
      const waitForGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
          clearInterval(waitForGoogle);
          geocodedRef.current = true;
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: coordinates.lat, lng: coordinates.lng } },
            (results, status) => {
              if (status === 'OK' && results?.[0]) {
                setInputValue(results[0].formatted_address);
              }
            }
          );
        }
      }, 100);
      return () => clearInterval(waitForGoogle);
    }
  }, [coordinates]);

  useEffect(() => {
    if (!inputRef.current) return;

    const loadGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        initAutocomplete();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            clearInterval(checkGoogle);
            initAutocomplete();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAP_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'geometry', 'formatted_address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.geometry) return;

        const lat = place.geometry.location?.lat() || 0;
        const lng = place.geometry.location?.lng() || 0;
        const address = place.formatted_address || '';

        setInputValue(address);
        onChange(address, { lat, lng });
      });
    };

    loadGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="location-search">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="location-search"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10"
          required={required}
        />
      </div>
    </div>
  );
}
