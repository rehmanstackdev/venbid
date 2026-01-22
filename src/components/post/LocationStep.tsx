import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocationMap } from "@/components/map/LocationMap";
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { mapTilerConfig } from '@/config/maptiler';

export interface LocationDetails {
  street: string;
  crossStreet: string;
  city: string;
  zip: string;
  showExactAddress: boolean;
}

interface LocationStepProps {
  location: LocationDetails;
  onChange: (location: LocationDetails) => void;
  errors: Partial<Record<keyof LocationDetails, string>>;
  phone?: string;
  onPhoneChange?: (phone: string) => void;
  coordinates?: { lat: number; long: number };
  onCoordinatesChange?: (coords: { lat: number; long: number } | null) => void;
}

export function LocationStep({ location, onChange, errors, phone = '', onPhoneChange, coordinates: initialCoordinates, onCoordinatesChange }: LocationStepProps) {
  const [zipValid, setZipValid] = useState<boolean | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates ? { lat: initialCoordinates.lat, lng: initialCoordinates.long } : null
  );
  const [geocoding, setGeocoding] = useState(false);

  const handleChange = <K extends keyof LocationDetails>(key: K, value: LocationDetails[K]) => {
    onChange({ ...location, [key]: value });
    if (key === 'zip' && errors.zip) {
      const { zip, ...rest } = errors;
      onChange({ ...location, [key]: value });
    }
  };

  useEffect(() => {
    const zipPattern = /^\d{5}(-\d{4})?$/;
    
    if (location.zip.length >= 5 && zipPattern.test(location.zip)) {
      setZipValid(true);
      setGeocoding(true);
      
      const searchQuery = location.city 
        ? `${location.zip}, ${location.city}`
        : location.zip;
      
      fetch(
        `${mapTilerConfig.geocodingUrl}/${encodeURIComponent(searchQuery)}.json?key=${mapTilerConfig.apiKey}&limit=5`
      )
        .then(res => res.json())
        .then(data => {
          if (data?.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const coords = { lat, lng };
            setCoordinates(coords);
            onCoordinatesChange?.({ lat, long: lng });
          } else {
            setCoordinates(null);
            onCoordinatesChange?.(null);
          }
          setGeocoding(false);
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          setCoordinates(null);
          onCoordinatesChange?.(null);
          setGeocoding(false);
        });
    } else if (location.zip.length > 0) {
      setZipValid(false);
      setCoordinates(null);
      setGeocoding(false);
    } else {
      setZipValid(null);
      setCoordinates(null);
      setGeocoding(false);
    }
  }, [location.zip, location.city]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Where is the job located?</h2>
        <p className="text-muted-foreground text-sm">
          Help service providers know where the work is needed
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
   
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., (312) 555-0123"
            value={phone}
            onChange={(e) => onPhoneChange?.(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Service providers will use this to contact you
          </p>
        </div>

 
        <div className="space-y-2">
          <Label htmlFor="street">Street Address (optional)</Label>
          <Input
            id="street"
            placeholder="e.g., 123 Main St"
            value={location.street}
            onChange={(e) => handleChange("street", e.target.value)}
          />
        </div>

    
        <div className="space-y-2">
          <Label htmlFor="crossStreet">Cross Street (optional)</Label>
          <Input
            id="crossStreet"
            placeholder="e.g., Oak Ave"
            value={location.crossStreet}
            onChange={(e) => handleChange("crossStreet", e.target.value)}
          />
        </div>

      
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-muted-foreground text-xs">(recommended)</span>
          </Label>
          <Input
            id="city"
            placeholder="e.g., Chicago"
            value={location.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Helps locate your ZIP code accurately
          </p>
        </div>

  
        <div className="space-y-2">
          <Label htmlFor="zip">
            ZIP Code <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="zip"
              placeholder="e.g., 60601"
              value={location.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              className={errors.zip ? "border-destructive pr-10" : "pr-10"}
            />
            {geocoding && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!geocoding && location.zip.length >= 5 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {zipValid && coordinates ? (
                  <CheckCircle2 className="h-5 w-5 text-verified" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            )}
          </div>
          {errors.zip ? (
            <p className="text-xs text-destructive">{errors.zip}</p>
          ) : zipValid === false ? (
            <p className="text-xs text-destructive">
              Please enter a valid ZIP code
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter your ZIP code
            </p>
          )}
        </div>
      </div>


      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium text-sm">Show exact address</p>
            <p className="text-xs text-muted-foreground">
              {location.showExactAddress
                ? "Your full address will be visible to everyone"
                : "Only approximate area will be shown until you share details"}
            </p>
          </div>
        </div>
        <Switch
          checked={location.showExactAddress}
          onCheckedChange={(checked) => handleChange("showExactAddress", checked)}
        />
      </div>


      {coordinates && (
        <div className="space-y-2">
          <Label>Location Preview</Label>
          <LocationMap
            lat={coordinates.lat}
            lng={coordinates.lng}
            showExactAddress={location.showExactAddress}
            className="h-64 rounded-lg overflow-hidden border border-border"
          />
          <p className="text-xs text-muted-foreground text-center">
            {location.showExactAddress
              ? "Exact location marker shown"
              : "Approximate area shown (5-mile radius)"}
          </p>
        </div>
      )}
    </div>
  );
}
