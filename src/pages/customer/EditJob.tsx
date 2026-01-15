import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CategoryStep } from "@/components/post/CategoryStep";
import { DetailsStep, JobDetails } from "@/components/post/DetailsStep";
import { LocationStep, LocationDetails } from "@/components/post/LocationStep";
import { PreviewStep } from "@/components/post/PreviewStep";
import { isValidIllinoisZip } from "@/data/illinoisZips";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { jobsApi, JobCategory } from "@/api/jobs";
import { categories } from "@/data/categories";

const STEPS = [
  { id: 1, title: "Category", description: "Select service type" },
  { id: 2, title: "Details", description: "Job information" },
  { id: 3, title: "Location", description: "Where is the job" },
  { id: 4, title: "Preview", description: "Review & publish" },
];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [location, setLocation] = useState<LocationDetails>({
    street: "",
    crossStreet: "",
    city: "",
    zip: "",
    showExactAddress: false,
  });

  // Store original values for change detection
  const [originalData, setOriginalData] = useState<{
    category: number | null;
    details: JobDetails;
    location: LocationDetails;
    phone: string;
  } | null>(null);

  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof JobDetails, string>>>({});
  const [locationErrors, setLocationErrors] = useState<Partial<Record<keyof LocationDetails, string>>>({});

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const job = await jobsApi.getJobById(id);
        const category = categories.find(c => c.slug === job.category);
        
        const jobDetails = {
          title: job.title,
          description: job.description,
          budget: Math.floor(job.budget).toString(),
          images: job.images ? job.images.map((url, index) => ({
            id: `existing-${index}`,
            file: null as any,
            preview: url,
            isFeatured: index === 0,
          })) : [],
        };
        const jobLocation = {
          street: job.street || "",
          crossStreet: job.crossStreet || "",
          city: job.city || "",
          zip: job.zip,
          showExactAddress: job.showExactAddress || false,
        };
        
        setSelectedCategory(category?.id || null);
        setDetails(jobDetails);
        setLocation(jobLocation);
        setPhone(job.phone || "");
        
        // Store original data
        setOriginalData({
          category: category?.id || null,
          details: jobDetails,
          location: jobLocation,
          phone: job.phone || "",
        });
      } catch (error) {
        toast.error("Failed to load job");
        navigate("/customer/my-posts");
      }
    };
    fetchJob();
  }, [id, navigate]);

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
        if (!phone.trim()) {
          toast.error("Please fill the Phone Number field");
          return false;
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

  // Check if any changes were made
  const hasChanges = () => {
    if (!originalData) return false;
    
    if (selectedCategory !== originalData.category) return true;
    if (details.title !== originalData.details.title) return true;
    if (details.description !== originalData.details.description) return true;
    if (details.budget !== originalData.details.budget) return true;
    if (location.street !== originalData.location.street) return true;
    if (location.crossStreet !== originalData.location.crossStreet) return true;
    if (location.city !== originalData.location.city) return true;
    if (location.zip !== originalData.location.zip) return true;
    if (location.showExactAddress !== originalData.location.showExactAddress) return true;
    if (phone !== originalData.phone) return true;
    
    // Check if images changed (new files added or removed)
    if (details.images.length !== originalData.details.images.length) return true;
    if (details.images.some((img: any) => img.file instanceof File)) return true;
    
    return false;
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
    if (!selectedCategory || !id) return;

    setIsSubmitting(true);
    
    try {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) throw new Error('Invalid category');

      const imageFiles = details.images
        .filter((img: any) => img.file instanceof File)
        .map((img: any) => img.file);

      await jobsApi.updateJob(id, {
        title: details.title,
        description: details.description,
        category: category.slug as JobCategory,
        budget: parseFloat(details.budget.split('-')[0]),
        city: location.city,
        zip: location.zip,
        street: location.street,
        crossStreet: location.crossStreet,
        showExactAddress: location.showExactAddress,
        images: imageFiles,
        phone: phone,
      });

      // Build specific update message
      const updatedFields = [];
      if (originalData) {
        if (selectedCategory !== originalData.category) updatedFields.push('category');
        if (details.title !== originalData.details.title) updatedFields.push('title');
        if (details.description !== originalData.details.description) updatedFields.push('description');
        if (details.budget !== originalData.details.budget) updatedFields.push('budget');
        if (location.city !== originalData.location.city || location.zip !== originalData.location.zip) updatedFields.push('location');
        if (details.images.some((img: any) => img.file instanceof File) || details.images.length !== originalData.details.images.length) updatedFields.push('images');
      }

      const message = updatedFields.length > 0 
        ? `Updated: ${updatedFields.join(', ')}`
        : 'Changes have been saved successfully.';

      toast.success("Your job has been updated!", {
        description: message,
      });
      navigate("/customer/my-posts");
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || "Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/customer/my-posts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Edit Job</h1>
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
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
            location={location}
            onChange={setLocation}
            errors={locationErrors}
            phone={phone}
            onPhoneChange={setPhone}
          />
        )}

        {currentStep === 4 && selectedCategory && (
          <PreviewStep
            categoryId={selectedCategory}
            details={details}
            location={location}
            onUpdateImages={(images) => setDetails({ ...details, images })}
          />
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
            <Button onClick={handleUpdate} disabled={isSubmitting || !hasChanges()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Job
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
