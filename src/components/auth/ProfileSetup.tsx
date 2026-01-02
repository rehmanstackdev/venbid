import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, UserCircle, Phone, MapPin, Building2, Upload, Shield } from 'lucide-react';
import { categories } from '@/data/categories';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  city: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Privacy Policy' }),
  }),
});

const vendorSchema = profileSchema.extend({
  serviceCategory: z.string().min(1, 'Please select a service category'),
  companyName: z.string().optional(),
});

interface ProfileSetupProps {
  userType: 'customer' | 'vendor';
  onComplete: (data: ProfileData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export interface ProfileData {
  fullName: string;
  phone: string;
  city?: string;
  termsAccepted: boolean;
  serviceCategory?: string;
  companyName?: string;
  verificationDocument?: File;
}

export function ProfileSetup({ userType, onComplete, onClose, isLoading = false }: ProfileSetupProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [serviceCategory, setServiceCategory] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      fullName,
      phone,
      city: city || undefined,
      termsAccepted,
      ...(userType === 'vendor' && {
        serviceCategory,
        companyName: companyName || undefined,
      }),
    };

    const schema = userType === 'vendor' ? vendorSchema : profileSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    await onComplete({
      ...data,
      verificationDocument: verificationDocument || undefined,
    });
    setSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, document: 'File size must be less than 10MB' });
        return;
      }
      setVerificationDocument(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            {userType === 'vendor' 
              ? 'Set up your vendor profile to start finding work'
              : 'Tell us a bit about yourself'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Name / Nickname *</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Stored internally, never shown publicly</p>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City (optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  placeholder="Chicago"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Vendor-specific fields */}
            {userType === 'vendor' && (
              <>
                {/* Service Category */}
                <div className="space-y-2">
                  <Label>Primary Service Category *</Label>
                  <Select value={serviceCategory} onValueChange={setServiceCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary service" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceCategory && <p className="text-sm text-destructive">{errors.serviceCategory}</p>}
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name (optional)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Your Business Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Verification Document */}
                <div className="space-y-2">
                  <Label>Verification Document (optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload ID or business license to get verified
                    </p>
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {verificationDocument ? verificationDocument.name : 'Choose file'}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can also do this later in your profile
                    </p>
                  </div>
                  {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
                </div>
              </>
            )}

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy *
                </label>
              </div>
            </div>
            {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || submitting}>
              {submitting ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
