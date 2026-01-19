import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { vendorApi } from '@/api/vendor';
import { LocationSearchInput } from '@/components/location/LocationSearchInput';
import { categories } from '@/data/categories';

export default function VendorProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [viewImageDialog, setViewImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await vendorApi.getProfile();
        console.log('Vendor profile response:', response);
        const data = response.data || response;
        const vendorData = data.vendor || data;
        const userData = data.user || data;
        
        const coords = userData.coordinates || { lat: 0, long: 0 };
        console.log('Fetched coordinates from API:', coords);
        setDocumentVerified(vendorData.documentVerified || false);
        setExistingDocuments(vendorData.verificationDocuments || []);
        console.log('Existing documents:', vendorData.verificationDocuments);
        
        setProfile(prev => ({
          ...prev,
          name: userData.name || '',
          phone: userData.phone || '',
          serviceCategory: vendorData.serviceCategory || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          address: userData.address || '',
          companyName: vendorData.companyName || '',
          coordinates: coords,
          locationSearch: userData.address || '',
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

  const handleDeleteDocument = async (doc: string, index: number) => {
    try {
      await vendorApi.deleteDocument(doc);
      setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
      toast({
        title: 'Document deleted',
        description: 'Document has been removed successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataToSend: any = {
        name: profile.name,
        phone: profile.phone,
        serviceCategory: profile.serviceCategory,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        address: profile.address,
        companyName: profile.companyName,
        verificationDocument: documents.length > 0 ? documents : undefined,
      };

      console.log('Profile - profile.coordinates before check:', profile.coordinates);
      
      // Always include coordinates if they exist
      if (profile.coordinates.lat !== 0 || profile.coordinates.long !== 0) {
        dataToSend.coordinates = profile.coordinates;
        console.log('Profile - Including coordinates:', profile.coordinates);
      } else {
        console.log('Profile - Coordinates are 0,0 - not sending');
      }

      console.log('Profile - Final dataToSend:', dataToSend);
      console.log('Profile - dataToSend.coordinates:', dataToSend.coordinates);
      
      await vendorApi.updateProfile(dataToSend);
      
      // Fetch updated profile to get latest coordinates
      const updatedProfile = await vendorApi.getProfile();
      const updatedData = updatedProfile.data || updatedProfile;
      const updatedUserData = updatedData.user || updatedData;
      
      // Update localStorage with new coordinates
      const currentUser = localStorage.getItem('user_data');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        userData.coordinates = updatedUserData.coordinates;
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
      setDocuments([]);
      window.location.reload();
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

  if (isFetching) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
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
            {/* Account Type */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium">Vendor</p>
                </div>
                <Badge variant={documentVerified ? "default" : "secondary"}>
                  {documentVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
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
              value={profile.locationSearch}
              coordinates={profile.coordinates.lat !== 0 && profile.coordinates.long !== 0 ? { lat: profile.coordinates.lat, lng: profile.coordinates.long } : undefined}
              onChange={(address, coordinates) => {
                console.log('Profile - onChange received:', { address, coordinates });
                setProfile(prev => {
                  const newProfile = {
                    ...prev,
                    locationSearch: address,
                    address: address,
                    coordinates: { lat: coordinates.lat, long: coordinates.lng },
                  };
                  console.log('Profile - New profile state:', newProfile);
                  return newProfile;
                });
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
              <Label>Verification Documents</Label>
              {existingDocuments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {existingDocuments.map((doc, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={doc}
                        alt={`Document ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedImage(doc);
                          setViewImageDialog(true);
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteDocument(doc, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Image Viewer Dialog */}
      <Dialog open={viewImageDialog} onOpenChange={setViewImageDialog}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setViewImageDialog(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={selectedImage}
              alt="Document"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
