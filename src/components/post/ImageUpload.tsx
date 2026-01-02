import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isFeatured: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 10, 
  maxSizeMB = 5 
}: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    const newImages: UploadedImage[] = filesToAdd
      .filter((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        isFeatured: images.length === 0 && filesToAdd.indexOf(file) === 0,
      }));

    onChange([...images, ...newImages]);
  }, [images, onChange, maxImages, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    disabled: images.length >= maxImages,
  });

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    // If we removed the featured image, make the first one featured
    if (updated.length > 0 && !updated.some((img) => img.isFeatured)) {
      updated[0].isFeatured = true;
    }
    onChange(updated);
  };

  const setFeatured = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isFeatured: img.id === id,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          images.length >= maxImages && "opacity-50 cursor-not-allowed",
          !isDragActive && "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragActive ? "Drop images here" : "Drag & drop images"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse • JPG, PNG, WebP up to {maxSizeMB}MB
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {images.length} / {maxImages} images
          </p>
        </div>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden group border-2",
                image.isFeatured ? "border-primary" : "border-transparent"
              )}
            >
              <img
                src={image.preview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />

              {/* Featured badge */}
              {image.isFeatured && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isFeatured && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setFeatured(image.id)}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Set Featured
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
