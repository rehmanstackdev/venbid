import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/data/categories';

const profileSchema = z.object({
  full_name: z.string().max(100, 'Name must be less than 100 characters').nullable().optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone format').nullable().optional().or(z.literal('')),
  city: z.string().max(100, 'City must be less than 100 characters').nullable().optional().or(z.literal('')),
  company_name: z.string().max(100, 'Company name must be less than 100 characters').nullable().optional().or(z.literal('')),
  service_category: z.string().nullable().optional(),
});

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  company_name: string | null;
  service_category: string | null;
  verification_status: string | null;
}

interface VerificationDocument {
  id: string;
  document_type: string;
  document_url: string;
  status: string;
  created_at: string;
}

export default function Profile() {
  const { user, loading: authLoading, isCustomer, isVendor } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    full_name: 'Demo User',
    phone: '',
    avatar_url: null,
    city: '',
    company_name: '',
    service_category: null,
    verification_status: 'unverified',
  });
  const [verificationDoc, setVerificationDoc] = useState<VerificationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    // Mock upload - just create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, avatar_url: previewUrl }));
    toast({ title: 'Avatar updated', description: 'Your profile picture has been updated.' });
    setIsUploading(false);

    // Commented out Supabase upload logic
    // try {
    //   const fileExt = file.name.split('.').pop();
    //   const filePath = `${user.id}/avatar.${fileExt}`;
    //   const { error: uploadError } = await supabase.storage
    //     .from('avatars')
    //     .upload(filePath, file, { upsert: true });
    //   if (uploadError) throw uploadError;
    //   const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    //   const { error: updateError } = await supabase
    //     .from('profiles')
    //     .update({ avatar_url: publicUrl })
    //     .eq('user_id', user.id);
    //   if (updateError) throw updateError;
    //   setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    //   toast({ title: 'Avatar updated', description: 'Your profile picture has been updated.' });
    // } catch (error) {
    //   console.error('Error uploading avatar:', error);
    //   toast({ title: 'Upload failed', description: 'Failed to upload avatar. Please try again.', variant: 'destructive' });
    // } finally {
    //   setIsUploading(false);
    // }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Please select an image (JPG, PNG, WebP) or PDF file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select a file under 5MB.', variant: 'destructive' });
      return;
    }

    setIsUploadingDoc(true);

    // Mock upload
    const mockDoc: VerificationDocument = {
      id: `doc-${Date.now()}`,
      document_type: file.type.includes('pdf') ? 'business_license' : 'government_id',
      document_url: URL.createObjectURL(file),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    setVerificationDoc(mockDoc);
    setProfile(prev => ({ ...prev, verification_status: 'pending' }));
    toast({ title: 'Document uploaded', description: 'Your verification document has been submitted for review.' });
    setIsUploadingDoc(false);

    // Commented out Supabase upload logic
    // try {
    //   const fileExt = file.name.split('.').pop();
    //   const fileName = `${user.id}/verification-${Date.now()}.${fileExt}`;
    //   const { error: uploadError } = await supabase.storage
    //     .from('verification-documents')
    //     .upload(fileName, file, { upsert: true });
    //   if (uploadError) throw uploadError;
    //   const { data: signedUrlData } = await supabase.storage
    //     .from('verification-documents')
    //     .createSignedUrl(fileName, 60 * 60 * 24 * 365);
    //   const documentUrl = signedUrlData?.signedUrl || fileName;
    //   const { data: docData, error: insertError } = await supabase
    //     .from('verification_documents')
    //     .insert({
    //       user_id: user.id,
    //       document_type: file.type.includes('pdf') ? 'business_license' : 'government_id',
    //       document_url: documentUrl,
    //       status: 'pending',
    //     })
    //     .select()
    //     .single();
    //   if (insertError) throw insertError;
    //   await supabase.from('profiles').update({ verification_status: 'pending' }).eq('user_id', user.id);
    //   setVerificationDoc(docData);
    //   setProfile(prev => ({ ...prev, verification_status: 'pending' }));
    //   toast({ title: 'Document uploaded', description: 'Your verification document has been submitted for review.' });
    // } catch (error) {
    //   console.error('Error uploading document:', error);
    //   toast({ title: 'Upload failed', description: 'Failed to upload document. Please try again.', variant: 'destructive' });
    // } finally {
    //   setIsUploadingDoc(false);
    // }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validation = profileSchema.safeParse({
      full_name: profile.full_name,
      phone: profile.phone,
      city: profile.city,
      company_name: profile.company_name,
      service_category: profile.service_category,
    });

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
      toast({ title: 'Validation error', description: errorMessage, variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    // Mock save
    console.log('Mock profile save:', profile);
    toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
    setIsSaving(false);

    // Commented out Supabase save logic
    // const updateData: Record<string, string | null> = {
    //   full_name: profile.full_name,
    //   phone: profile.phone,
    // };
    // if (isVendor) {
    //   updateData.city = profile.city;
    //   updateData.company_name = profile.company_name;
    //   updateData.service_category = profile.service_category;
    // }
    // const { error } = await supabase.from('profiles').update(updateData).eq('user_id', user.id);
    // setIsSaving(false);
    // if (error) {
    //   toast({ title: 'Update failed', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    // } else {
    //   toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
    // }
  };

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getVerificationBadge = () => {
    const status = profile.verification_status || 'unverified';
    
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending Review</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile Settings</h1>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Update your personal information and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={profile.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload a new photo
                </p>
              </div>

              {/* Account Type with Verification Status */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium">
                      {isVendor ? 'Vendor' : isCustomer ? 'Customer' : 'User'}
                    </p>
                  </div>
                  {isVendor && getVerificationBadge()}
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              {/* Vendor-specific fields */}
              {isVendor && (
                <>
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City You Work In</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Chicago"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Business/Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Your Business Name"
                      value={profile.company_name || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                    />
                  </div>

                  {/* Service Category */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceCategory">Primary Service Category</Label>
                    <Select
                      value={profile.service_category || ''}
                      onValueChange={(value) => setProfile(prev => ({ ...prev, service_category: value }))}
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

                  {/* Verification Document Upload */}
                  <div className="space-y-3">
                    <Label>Verification Document</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload a government ID or business license to get verified.
                    </p>
                    
                    {verificationDoc ? (
                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                          {verificationDoc.status === 'approved' ? (
                            <FileCheck className="h-5 w-5 text-green-500" />
                          ) : verificationDoc.status === 'pending' ? (
                            <Loader2 className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {verificationDoc.document_type === 'business_license' 
                                ? 'Business License' 
                                : 'Government ID'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted on {new Date(verificationDoc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              verificationDoc.status === 'approved' 
                                ? 'default' 
                                : verificationDoc.status === 'pending' 
                                  ? 'secondary' 
                                  : 'destructive'
                            }
                          >
                            {verificationDoc.status === 'approved' 
                              ? 'Approved' 
                              : verificationDoc.status === 'pending' 
                                ? 'Pending' 
                                : 'Rejected'}
                          </Badge>
                        </div>
                        
                        {verificationDoc.status === 'rejected' && (
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => docInputRef.current?.click()}
                              disabled={isUploadingDoc}
                            >
                              {isUploadingDoc ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload New Document
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
                        onClick={() => docInputRef.current?.click()}
                      >
                        {isUploadingDoc ? (
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                        ) : (
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        )}
                        <p className="text-sm font-medium">
                          {isUploadingDoc ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP or PDF up to 5MB
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={docInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {/* Save Button */}
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
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
      </main>
    </div>
  );
}
