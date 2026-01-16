import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CategoryStep } from "@/components/post/CategoryStep";
import { DetailsStep, JobDetails } from "@/components/post/DetailsStep";
import { LocationStep, LocationDetails } from "@/components/post/LocationStep";
import { PreviewStep } from "@/components/post/PreviewStep";
import { isValidIllinoisZip, getZipCoordinates } from "@/data/illinoisZips";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { categories } from "@/data/categories";

const STEPS = [
  { id: 1, title: "Category", description: "Select service type" },
  { id: 2, title: "Details", description: "Job information" },
  { id: 3, title: "Location", description: "Where is the job" },
  { id: 4, title: "Preview", description: "Review & update" },
];

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [details, setDetails] = useState<JobDetails>({
    title: "",
    description: "",
    budget: "",
    images: [],
  });
  const [location, setLocation] = useState<LocationDetails>({
    street: "",
    crossStreet: "",
    city: "",
    zip: "",
    showExactAddress: false,
  });

  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof JobDetails, string>>>({});
  const [locationErrors, setLocationErrors] = useState<Partial<Record<keyof LocationDetails, string>>>({});

  useEffect(() => {
    if (!id || !user) {
      navigate("/my-posts");
      return;
    }
    fetchListing();
  }, [id, user]);

  const fetchListing = async () => {
    if (!id || !user) return;

    // Mock - just set loading to false
    toast.error("Edit listing not available in mock mode");
    navigate("/my-posts");
    setIsLoading(false);
    
    
  };

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
        } else if (details.title.length < 10) {
          dErrors.title = "Title must be at least 10 characters";
        }
        if (!details.description.trim()) {
          dErrors.description = "Description is required";
        } else if (details.description.length < 20) {
          dErrors.description = "Description must be at least 20 characters";
        }
        if (!details.budget.trim()) {
          dErrors.budget = "Budget is required";
        } else if (!/^\d+(-\d+)?$/.test(details.budget)) {
          dErrors.budget = "Enter a valid amount (e.g., 100 or 100-200)";
        }
        setDetailErrors(dErrors);
        if (Object.keys(dErrors).length > 0) {
          toast.error("Please fix the errors before continuing");
          return false;
        }
        return true;

      case 3:
        const lErrors: Partial<Record<keyof LocationDetails, string>> = {};
        if (!location.zip.trim()) {
          lErrors.zip = "ZIP code is required";
        } else if (!isValidIllinoisZip(location.zip)) {
          lErrors.zip = "Please enter a valid Illinois ZIP code";
        }
        setLocationErrors(lErrors);
        if (Object.keys(lErrors).length > 0) {
          toast.error("Please fix the errors before continuing");
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
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !id || !user) return;

    setIsSubmitting(true);

    toast.success("Your listing has been updated!");
    navigate(`/listing/${id}`);
    setIsSubmitting(false);
    
  
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to edit listings.
          </p>
          <Link to="/auth?tab=login&redirect=/my-posts">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Edit Listing</h1>
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
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
                  {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container py-8 max-w-2xl">
        {currentStep === 1 && (
          <CategoryStep selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        )}

        {currentStep === 2 && (
          <DetailsStep details={details} onChange={setDetails} errors={detailErrors} />
        )}

        {currentStep === 3 && (
          <LocationStep location={location} onChange={setLocation} errors={locationErrors} />
        )}

        {currentStep === 4 && selectedCategory && (
          <PreviewStep categoryId={selectedCategory} details={details} location={location} />
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Listing
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditListing;
