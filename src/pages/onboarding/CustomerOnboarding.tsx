import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { customerApi } from "@/api/customer";
import { LocationSearchInput } from "@/components/location/LocationSearchInput";

export default function CustomerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    coordinates: { lat: 0, long: 0 },
    locationSearch: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { locationSearch, ...profileData } = formData;
      await customerApi.updateProfile(profileData);
      toast({ title: "Profile completed!", description: "Welcome to Venbid." });
      navigate("/customer/my-posts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Tell us a bit more about yourself</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/customer/my-posts")}
              >
                Skip for now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LocationSearchInput
                value={formData.locationSearch}
                onChange={(address, coordinates) => {
                  setFormData({
                    ...formData,
                    locationSearch: address,
                    coordinates: { lat: coordinates.lat, long: coordinates.lng },
                  });
                }}
                label="Search Location"
                placeholder="Search for your address"
                required
              />

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Chicago"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="IL"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="60601"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
