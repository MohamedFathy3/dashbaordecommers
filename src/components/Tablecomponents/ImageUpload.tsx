// components/Tablecomponents/ImageUpload.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageChange: (file: File | File[] | null) => void;
  currentImage?: string | string[];
  multiple?: boolean;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  currentImage,
  multiple = false,
  accept = "image/*"
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      // Handle multiple files for gallery
      const fileArray = Array.from(files);
      onImageChange(fileArray);
      
      // Create preview URLs
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    } else {
      // Handle single file
      const file = files[0];
      onImageChange(file);
      
      // Create preview URL
      setPreviewUrls([URL.createObjectURL(file)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (multiple) {
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newPreviewUrls);
      // You might want to handle the actual file removal here
    } else {
      setPreviewUrls([]);
      onImageChange(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle existing images from database
  const displayImages = previewUrls.length > 0 
    ? previewUrls 
    : Array.isArray(currentImage) 
      ? currentImage 
      : currentImage 
        ? [currentImage] 
        : [];

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      
      {/* Upload Button */}
      <Button
        type="button"
        onClick={handleClick}
        variant="outline"
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <i className="fas fa-cloud-upload-alt text-xl"></i>
          <div className="text-left">
            <div className="font-medium">
              {multiple ? 'Upload Multiple Images' : 'Upload Image'}
            </div>
            <div className="text-sm">
              {multiple ? 'Drag & drop or click to select multiple images' : 'Drag & drop or click to select an image'}
            </div>
          </div>
        </div>
      </Button>

      {/* Preview Gallery */}
      {displayImages.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {displayImages.length} image{displayImages.length !== 1 ? 's' : ''} selected
          </p>
          <div className={`grid gap-3 ${
            multiple 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1 max-w-xs'
          }`}>
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayImages.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <i className="fas fa-images text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">
            {multiple ? 'No images uploaded yet' : 'No image uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
};