import { useState, useEffect } from 'react';
import { Camera, Save, Loader2, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { vendorApi } from '@/api/vendor';
import { LocationSearchInput } from '@/components/location/LocationSearchInput';
import { categories } from '@/data/categories';

export default function VendorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [documents, setDocuments] = useState<File[]>([]);
  const [profile, setProfile] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    serviceCategory: '',
    city: '',
    state: '',
    zipCode: '',
    address: '',
    companyName: '',
    coordinates: { lat: 0, long: 0 },
    locationSearch: '',
    avatarUrl: null as string | null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await vendorApi.getProfile();
        const coords = data.coordinates || { lat: 0, long: 0 };
        setProfile(prev => ({
          ...prev,
          name: data.name || '',
          phone: data.phone || '',
          serviceCategory: data.serviceCategory || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          address: data.address || '',
          companyName: data.companyName || '',
          coordinates: coords,
          locationSearch: '',
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (documents.length + files.length > 5) {
      toast({ title: 'Error', description: 'Maximum 5 documents allowed', variant: 'destructive' });
      return;
    }
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Error', description: `${file.name} exceeds 10MB limit`, variant: 'destructive' });
        return;
      }
    }
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await vendorApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
        serviceCategory: profile.serviceCategory,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        address: profile.address,
        companyName: profile.companyName,
        coordinates: profile.coordinates,
        verificationDocument: documents.length > 0 ? documents : undefined,
      });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
      setDocuments([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, avatarUrl: previewUrl }));
    toast({ title: 'Avatar updated', description: 'Your profile picture has been updated.' });
  };

  const getInitials = () => {
    if (profile.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (isFetching) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Click to upload a new photo
              </p>
            </div>

            {/* Account Type */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-medium">Vendor</p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Location Search */}
            <LocationSearchInput
              value=""
              coordinates={profile.coordinates.lat !== 0 ? { lat: profile.coordinates.lat, lng: profile.coordinates.long } : undefined}
              onChange={(address, coordinates) => {
                setProfile(prev => ({
                  ...prev,
                  locationSearch: address,
                  coordinates: { lat: coordinates.lat, long: coordinates.lng },
                }));
              }}
              label="Search Location"
              placeholder="Search for your address"
            />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name/Nickname *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            {/* Service Category */}
            <div className="space-y-2">
              <Label htmlFor="serviceCategory">Primary Service Category *</Label>
              <Select
                value={profile.serviceCategory}
                onValueChange={(value) => setProfile(prev => ({ ...prev, serviceCategory: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="ABC Services LLC"
                value={profile.companyName}
                onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Chicago"
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="IL"
                value={profile.state}
                onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="60601"
                value={profile.zipCode}
                onChange={(e) => setProfile(prev => ({ ...prev, zipCode: e.target.value }))}
              />
            </div>

            {/* Verification Documents */}
            <div className="space-y-2">
              <Label htmlFor="documents">Verification Documents (max 5 files, 10MB each)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  id="documents"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleDocumentChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('documents')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                {documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
