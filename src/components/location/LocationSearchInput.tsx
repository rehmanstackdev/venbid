import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

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
  const [inputValue, setInputValue] = useState(value || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Reverse geocode coordinates to address on mount
  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng && !inputValue) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`
      )
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            setInputValue(data.display_name);
          }
        })
        .catch(err => console.error('Reverse geocoding error:', err));
    }
  }, [coordinates, inputValue]);

  // Search for locations
  useEffect(() => {
    if (inputValue.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(inputValue)}&` +
          `limit=7&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }
        
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }, 1000); // Increased debounce to 1 second

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelect = (result: LocationResult) => {
    const address = result.display_name;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setInputValue(address);
    setShowResults(false);
    onChange(address, { lat, lng });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location-search">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          id="location-search"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10"
          required={required}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {showResults && results.length > 0 && (
          <Command className="absolute top-full mt-1 w-full z-50 border rounded-md bg-popover shadow-md max-h-[50vh] overflow-hidden">
            <CommandList className="max-h-[50vh] overflow-y-auto">
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.place_id}
                    onSelect={() => {
                      handleSelect(result);
                    }}
                    className="cursor-pointer py-3"
                  >
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2 text-sm">{result.display_name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </div>
    </div>
  );
}
