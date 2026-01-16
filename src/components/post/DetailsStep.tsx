import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload, UploadedImage } from "./ImageUpload";

export interface JobDetails {
  title: string;
  description: string;
  budget: string;
  images: UploadedImage[];
}

interface DetailsStepProps {
  details: JobDetails;
  onChange: (details: JobDetails) => void;
  errors: Partial<Record<keyof JobDetails, string>>;
}

export function DetailsStep({ details, onChange, errors }: DetailsStepProps) {
  const handleChange = <K extends keyof JobDetails>(key: K, value: JobDetails[K]) => {
    onChange({ ...details, [key]: value });
  };


  const handleBudgetChange = (value: string) => {
    const sanitized = value.replace(/[^0-9-]/g, "");
    handleChange("budget", sanitized);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Describe your job</h2>
        <p className="text-muted-foreground text-sm">
          Provide details to help service providers understand your needs
        </p>
      </div>


      <div className="space-y-2">
        <Label htmlFor="title">
          Job Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Need plumber to fix leaking kitchen sink"
          value={details.title}
          onChange={(e) => handleChange("title", e.target.value)}
          maxLength={100}
          className={errors.title ? "border-destructive" : ""}
        />
        <div className="flex justify-between">
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Write a clear, descriptive title
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {details.title.length}/100
          </p>
        </div>
      </div>

      
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the work needed, any specific requirements, and your timeline..."
          value={details.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

     
      <div className="space-y-2">
        <Label htmlFor="budget">
          Budget <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="budget"
            placeholder="e.g., 100 or 100-200"
            value={details.budget}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className={cn("pl-7", errors.budget && "border-destructive")}
          />
        </div>
        {errors.budget ? (
          <p className="text-xs text-destructive">{errors.budget}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Enter a single amount or range (e.g., 150 or 100-200)
          </p>
        )}
      </div>

  
      <div className="space-y-2">
        <Label>Photos (optional)</Label>
        <ImageUpload
          images={details.images}
          onChange={(images) => handleChange("images", images)}
        />
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
