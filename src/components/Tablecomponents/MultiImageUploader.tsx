// components/Tablecomponents/MultiImageUploader.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check, AlertCircle, Plus } from 'lucide-react';

export interface MultiImageUploaderProps {
  value?: {
    existing: string[];  // الصور القديمة
    new: File[];         // الصور الجديدة
  };
  onChange: (value: { existing: string[]; new: File[] }) => void;
  label?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  compact?: boolean;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  value, // جعلناها optional
  onChange,
  label = "Gallery Images",
  required = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10,
  compact = false,
}) => {
  // ✅ إصلاح: استخدام قيمة افتراضية عندما تكون value undefined
  const safeValue = value || { existing: [], new: [] };
  
  const [previewUrls, setPreviewUrls] = useState<{url: string, type: 'existing' | 'new', name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URLs
  useEffect(() => {
    const urls = [
      // الصور القديمة - استخدام safeValue بدلاً من value
      ...safeValue.existing.map(url => ({
        url,
        type: 'existing' as const,
        name: 'Existing Image'
      })),
      // الصور الجديدة - استخدام safeValue بدلاً من value
      ...safeValue.new.map(file => ({
        url: URL.createObjectURL(file),
        type: 'new' as const,
        name: file.name
      }))
    ];
    
    setPreviewUrls(urls);

    // Cleanup function - فقط للـ new files
    return () => {
      urls.forEach(item => {
        if (item.type === 'new') {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [safeValue.existing, safeValue.new]); // استخدام safeValue

  // Validate file
  const validateFile = (file: File): boolean => {
    setError(null);

    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    if (!acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return file.type === type;
    })) {
      setError(`File type must be: ${accept}`);
      return false;
    }

    // ✅ إصلاح: استخدام safeValue بدلاً من value
    const totalImages = safeValue.existing.length + safeValue.new.length;
    if (totalImages >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    return true;
  };

  const handleFilesChange = (newFiles: File[]) => {
    const validFiles: File[] = [];
    
    newFiles.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      // إضافة الملفات الجديدة للقائمة الحالية - استخدام safeValue
      const updatedValue = {
        existing: safeValue.existing,
        new: [...safeValue.new, ...validFiles]
      };
      onChange(updatedValue);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFilesChange(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    const item = previewUrls[index];
    
    if (item.type === 'existing') {
      // إزالة من الصور القديمة - استخدام safeValue
      const existingIndex = index;
      const updatedExisting = safeValue.existing.filter((_, i) => i !== existingIndex);
      onChange({
        existing: updatedExisting,
        new: safeValue.new
      });
    } else {
      // إزالة من الصور الجديدة - استخدام safeValue
      const newIndex = index - safeValue.existing.length;
      const updatedNew = safeValue.new.filter((_, i) => i !== newIndex);
      
      // تنظيف الـ URL
      URL.revokeObjectURL(item.url);
      
      onChange({
        existing: safeValue.existing,
        new: updatedNew
      });
    }
  };

  const handleRemoveAll = () => {
    // تنظيف كل الـ URLs للـ new files
    previewUrls.forEach(item => {
      if (item.type === 'new') {
        URL.revokeObjectURL(item.url);
      }
    });
    
    onChange({
      existing: [],
      new: []
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ إصلاح: استخدام safeValue بدلاً من value
  const totalImages = safeValue.existing.length + safeValue.new.length;
  const hasImages = totalImages > 0;

  return (
    <div className={`space-y-4 ${compact ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {hasImages && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Remove All
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }
          ${hasImages ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFilesChange(files);
            // Reset input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          accept={accept}
          multiple
          className="hidden"
        />

        <div className="text-center">
          {hasImages ? (
            <div className="space-y-4">
              {/* Image Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview.url} 
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full transition-opacity duration-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {preview.type === 'new' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    {preview.type === 'existing' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add More Button */}
                {totalImages < maxFiles && (
                  <div
                    onClick={handleClick}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Plus size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add More</span>
                  </div>
                )}
              </div>
              
              {/* Image Info */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {totalImages} {totalImages === 1 ? 'image' : 'images'} selected
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {safeValue.existing.length} existing, {safeValue.new.length} new
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                    {maxFiles - totalImages} remaining
                  </span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={handleClick}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload size={14} />
                  Add More Images
                </button>
              </div>
            </div>
          ) : (
            /* No Images State */
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                {isDragging ? (
                  <Upload className="text-2xl text-blue-500" />
                ) : (
                  <ImageIcon className="text-2xl text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  {isDragging ? 'Drop images here' : `Upload ${label}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Drag & drop or click to select multiple images
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {accept} • Max {maxSize / (1024 * 1024)}MB per file • Max {maxFiles} files
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Upload size={16} />
                Choose Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Additional Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>✓ Supports: {accept}</p>
        <p>✓ Maximum size: {maxSize / (1024 * 1024)}MB per file</p>
        <p>✓ Maximum files: {maxFiles}</p>
      </div>

      {/* Required State */}
      {required && !hasImages && (
        <div className="text-sm text-red-500 flex items-center gap-2">
          <AlertCircle size={14} />
          ⚠️ {label} is required
        </div>
      )}
    </div>
  );
};