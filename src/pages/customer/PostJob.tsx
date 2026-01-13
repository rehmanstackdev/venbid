import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CategoryStep } from "@/components/post/CategoryStep";
import { DetailsStep, JobDetails } from "@/components/post/DetailsStep";
import { LocationStep, LocationDetails } from "@/components/post/LocationStep";
import { PreviewStep } from "@/components/post/PreviewStep";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { jobsApi, JobCategory } from "@/api/jobs";
import { categories } from "@/data/categories";
import { useAuth } from "@/hooks/useAuth";
import { saveDraft, loadDraft, clearDraft } from "@/lib/jobDraft";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STEPS = [
  { id: 1, title: "Category", description: "Select service type" },
  { id: 2, title: "Details", description: "Job information" },
  { id: 3, title: "Location", description: "Where is the job" },
  { id: 4, title: "Preview", description: "Review & publish" },
];

export default function PostJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [details, setDetails] = useState<JobDetails>({
    title: "",
    description: "",
    budget: "",
    images: [],
  });
  const [locationData, setLocationData] = useState<LocationDetails>({
    street: "",
    crossStreet: "",
    city: "",
    zip: "",
    showExactAddress: false,
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setSelectedCategory(draft.selectedCategory);
      setDetails(draft.details);
      setLocationData(draft.location);
      if (draft.phone) setPhone(draft.phone);
      if (draft.coordinates) setCoordinates(draft.coordinates);
      
      // Check for step and autoPublish in URL
      const params = new URLSearchParams(location.search);
      const step = params.get('step');
      const autoPublish = params.get('autoPublish');
      
      if (step) {
        setCurrentStep(parseInt(step));
      }
      
      if (autoPublish === 'true' && user) {
        toast.info('Your job is ready to publish!');
      } else {
        toast.info('Draft restored');
      }
    }
  }, [location.search, user]);

  // Auto-save draft
  useEffect(() => {
    if (selectedCategory || details.title || locationData.zip) {
      saveDraft({
        selectedCategory,
        details,
        location: locationData,
        coordinates,
        phone,
      });
    }
  }, [selectedCategory, details, locationData, coordinates, phone]);

  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof JobDetails, string>>>({});
  const [locationErrors, setLocationErrors] = useState<Partial<Record<keyof LocationDetails, string>>>({});

  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!selectedCategory) {
          toast.error("Please select a category");
          return false;
        }
        return true;

      case 2:
        const dErrors: Partial<Record<keyof JobDetails, string>> = {};
        if (!details.title.trim()) {
          dErrors.title = "Title is required";
          toast.error("Please fill the Job Title field");
        } else if (details.title.length < 10) {
          dErrors.title = "Title must be at least 10 characters";
          toast.error("Job Title must be at least 10 characters");
        }
        if (!details.description.trim()) {
          dErrors.description = "Description is required";
          toast.error("Please fill the Description field");
        } else if (details.description.length < 20) {
          dErrors.description = "Description must be at least 20 characters";
          toast.error("Description must be at least 20 characters");
        }
        if (!details.budget.trim()) {
          dErrors.budget = "Budget is required";
          toast.error("Please fill the Budget field");
        } else if (!/^\d+(-\d+)?$/.test(details.budget)) {
          dErrors.budget = "Enter a valid amount (e.g., 100 or 100-200)";
          toast.error("Please enter a valid budget amount");
        }
        setDetailErrors(dErrors);
        if (Object.keys(dErrors).length > 0) {
          return false;
        }
        return true;

      case 3:
        const lErrors: Partial<Record<keyof LocationDetails, string>> = {};
        if (!locationData.zip.trim()) {
          lErrors.zip = "ZIP code is required";
          toast.error("Please fill the ZIP Code field");
        } else if (!/^\d{5}(-\d{4})?$/.test(locationData.zip.trim())) {
          lErrors.zip = "Please enter a valid ZIP code";
          toast.error("Please enter a valid ZIP code (e.g., 12345 or 12345-6789)");
        }
        if (!phone.trim()) {
          toast.error("Please fill the Phone Number field");
          return false;
        }
        setLocationErrors(lErrors);
        if (Object.keys(lErrors).length > 0) {
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    // Check if user is logged in
    if (!user) {
      toast.info('Please sign in to publish your job');
      navigate('/auth/customer', { state: { returnTo: '/post-job', autoPublish: true } });
      return;
    }

    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) throw new Error('Invalid category');

      const imageFiles = details.images
        .map((img: any) => img.file)
        .filter((file): file is File => file instanceof File);

      const jobData: any = {
        title: details.title,
        description: details.description,
        category: category.slug as JobCategory,
        budget: parseFloat(details.budget.split('-')[0]),
        city: locationData.city,
        zip: locationData.zip,
        street: locationData.street,
        crossStreet: locationData.crossStreet,
        showExactAddress: locationData.showExactAddress,
        images: imageFiles,
        phone: phone,
      };

      // Add coordinates if available
      if (coordinates) {
        jobData.coordinates = {
          lat: coordinates.lat,
          long: coordinates.lng
        };
      }

      await jobsApi.createJob(jobData);

      clearDraft();
      toast.success("Your job has been posted!", {
        description: "Service providers can now see and respond to your listing."
      });
      
      navigate("/customer/my-posts");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post your job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Post a Job</h1>
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          {!user && (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth/customer')}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center text-center",
                  step.id < currentStep && "text-primary",
                  step.id === currentStep && "text-foreground",
                  step.id > currentStep && "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1",
                    step.id < currentStep && "bg-primary text-primary-foreground",
                    step.id === currentStep && "bg-primary text-primary-foreground",
                    step.id > currentStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container py-8 max-w-2xl">
        {currentStep === 1 && (
          <CategoryStep
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

        {currentStep === 2 && (
          <DetailsStep
            details={details}
            onChange={setDetails}
            errors={detailErrors}
          />
        )}

        {currentStep === 3 && (
          <LocationStep
            location={locationData}
            onChange={setLocationData}
            errors={locationErrors}
            phone={phone}
            onPhoneChange={setPhone}
            onCoordinatesChange={setCoordinates}
          />
        )}

        {currentStep === 4 && selectedCategory && (
          <>
            {!user && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  You'll need to sign in to publish this job. Your progress is saved.
                </AlertDescription>
              </Alert>
            )}
            <PreviewStep
              categoryId={selectedCategory}
              details={details}
              location={locationData}
              coordinates={coordinates}
              onUpdateImages={(images) => setDetails({ ...details, images })}
            />
          </>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Publish Job
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
