import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isValidIllinoisZip, getZipCoordinates } from "@/data/illinoisZips";
import { LocationMap } from "@/components/map/LocationMap";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";

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
}

export function LocationStep({ location, onChange, errors }: LocationStepProps) {
  const [zipValid, setZipValid] = useState<boolean | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleChange = <K extends keyof LocationDetails>(key: K, value: LocationDetails[K]) => {
    onChange({ ...location, [key]: value });
  };

  // Validate ZIP and get coordinates
  useEffect(() => {
    if (location.zip.length === 5) {
      const valid = isValidIllinoisZip(location.zip);
      setZipValid(valid);
      if (valid) {
        setCoordinates(getZipCoordinates(location.zip));
      } else {
        setCoordinates(null);
      }
    } else {
      setZipValid(null);
      setCoordinates(null);
    }
  }, [location.zip]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Where is the job located?</h2>
        <p className="text-muted-foreground text-sm">
          Help service providers know where the work is needed
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Street */}
        <div className="space-y-2">
          <Label htmlFor="street">Street Address (optional)</Label>
          <Input
            id="street"
            placeholder="e.g., 123 Main St"
            value={location.street}
            onChange={(e) => handleChange("street", e.target.value)}
          />
        </div>

        {/* Cross Street */}
        <div className="space-y-2">
          <Label htmlFor="crossStreet">Cross Street (optional)</Label>
          <Input
            id="crossStreet"
            placeholder="e.g., Oak Ave"
            value={location.crossStreet}
            onChange={(e) => handleChange("crossStreet", e.target.value)}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City (optional)</Label>
          <Input
            id="city"
            placeholder="e.g., Chicago"
            value={location.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>

        {/* ZIP */}
        <div className="space-y-2">
          <Label htmlFor="zip">
            ZIP Code <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="zip"
              placeholder="e.g., 60601"
              value={location.zip}
              onChange={(e) => handleChange("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
              maxLength={5}
              className={errors.zip ? "border-destructive pr-10" : "pr-10"}
            />
            {location.zip.length === 5 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {zipValid ? (
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
              Please enter a valid Illinois ZIP code
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Illinois ZIP codes only (service area)
            </p>
          )}
        </div>
      </div>

      {/* Show exact address toggle */}
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

      {/* Map preview */}
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
