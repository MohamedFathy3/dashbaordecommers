// components/Tablecomponents/MultiImageUploader.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check, AlertCircle, Plus } from 'lucide-react';

export interface MultiImageUploaderProps {
  value?: {
    existing: string[];  // URLs للصور القديمة
    new: File[];         // ملفات الصور الجديدة
  };
  onChange: (value: { existing: string[]; new: File[] }) => void;
  label?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  compact?: boolean;
}

interface PreviewItem {
  url: string;
  type: 'existing' | 'new';
  name: string;
  id?: string;
  originalIndex: number; // ✅ إضافة originalIndex
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  value,
  onChange,
  label = "Gallery Images",
  required = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  compact = false,
}) => {
  // ✅ القيمة الآمنة
  const safeValue = React.useMemo(() => {
    if (!value) return { existing: [], new: [] };
    
    return {
      existing: Array.isArray(value.existing) ? value.existing : [],
      new: Array.isArray(value.new) ? value.new : []
    };
  }, [value]);
  
  const [previewUrls, setPreviewUrls] = useState<PreviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ توليد الـ previews مع originalIndex
  useEffect(() => {
    const newPreviewUrls: PreviewItem[] = [];

    // الصور القديمة (URLs)
    safeValue.existing.forEach((url, originalIndex) => {
      if (url && typeof url === 'string') {
        newPreviewUrls.push({
          url: url,
          type: 'existing',
          name: `Existing Image ${originalIndex + 1}`,
          id: `existing-${originalIndex}`,
          originalIndex: originalIndex // ✅ إضافة الفهرس الأصلي
        });
      }
    });

    // الصور الجديدة (Files)
    safeValue.new.forEach((file, originalIndex) => {
      if (file instanceof File) {
        newPreviewUrls.push({
          url: URL.createObjectURL(file),
          type: 'new',
          name: file.name,
          id: `new-${originalIndex}`,
          originalIndex: originalIndex // ✅ إضافة الفهرس الأصلي
        });
      }
    });

    console.log('🖼️ Generated preview URLs:', newPreviewUrls.map(p => ({
      type: p.type,
      name: p.name,
      originalIndex: p.originalIndex
    })));

    setPreviewUrls(newPreviewUrls);

    // تنظيف الذاكرة
    return () => {
      newPreviewUrls.forEach(item => {
        if (item.type === 'new') {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [safeValue.existing, safeValue.new]);

  // ✅ تحقق من الملف
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      };
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isTypeValid = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return file.type === type;
    });

    if (!isTypeValid) {
      return {
        isValid: false,
        error: `File type must be: ${accept}`
      };
    }

    const totalImages = safeValue.existing.length + safeValue.new.length;
    if (totalImages >= maxFiles) {
      return {
        isValid: false,
        error: `Maximum ${maxFiles} files allowed`
      };
    }

    return { isValid: true };
  };

  const handleFilesChange = (newFiles: File[]) => {
    setError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    newFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      const updatedValue = {
        existing: [...safeValue.existing],
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

  // ✅ الإصلاح النهائي لـ handleRemove
  const handleRemove = (index: number) => {
    const item = previewUrls[index];
    
    if (!item) return;

    console.log('🗑️ Removing item:', {
      type: item.type,
      name: item.name,
      previewIndex: index,
      originalIndex: item.originalIndex
    });

    if (item.type === 'existing') {
      // ✅ استخدم originalIndex لإزالة من existing array
      const updatedExisting = safeValue.existing.filter((_, i) => i !== item.originalIndex);
      
      const newValue = {
        existing: updatedExisting,
        new: safeValue.new
      };
      
      console.log('✅ Removed existing image, new value:', newValue);
      onChange(newValue);
      
    } else {
      // ✅ استخدم originalIndex لإزالة من new array
      const updatedNew = safeValue.new.filter((_, i) => i !== item.originalIndex);
      
      // تنظيف الـ URL
      URL.revokeObjectURL(item.url);
      
      const newValue = {
        existing: safeValue.existing,
        new: updatedNew
      };
      
      console.log('✅ Removed new file, new value:', newValue);
      onChange(newValue);
    }
  };

  const handleRemoveAll = () => {
    // تنظيف الـ URLs للـ new files فقط
    previewUrls.forEach(item => {
      if (item.type === 'new') {
        URL.revokeObjectURL(item.url);
      }
    });
    
    const resetValue = {
      existing: [],
      new: []
    };
    
    onChange(resetValue);
    
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalImages = safeValue.existing.length + safeValue.new.length;
  const hasImages = totalImages > 0;
  const canAddMore = totalImages < maxFiles;

  return (
    <div className={`space-y-4 ${compact ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalImages}/{maxFiles} files
          </span>
          
          {hasImages && (
            <button
              type="button"
              onClick={handleRemoveAll}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors px-2 py-1 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X size={12} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onClick={canAddMore ? handleClick : undefined}
        onDragOver={canAddMore ? handleDragOver : undefined}
        onDragLeave={canAddMore ? handleDragLeave : undefined}
        onDrop={canAddMore ? handleDrop : undefined}
        className={`
          border-2 border-dashed rounded-2xl p-6 transition-all duration-300
          ${canAddMore ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
          ${
            isDragging && canAddMore
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
              : hasImages
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (canAddMore) {
              handleFilesChange(files);
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          accept={accept}
          multiple
          className="hidden"
          disabled={!canAddMore}
        />

        <div className="text-center">
          {hasImages ? (
            <div className="space-y-4">
              {/* Image Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewUrls.map((preview, index) => (
                  <div key={preview.id || index} className="relative group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyNEM0My4zMTM3IDI0IDQ2IDI2LjY4NjMgNDYgMzBDNDYgMzMuMzEzNyA0My4zMTM3IDM2IDQwIDM2QzM2LjY4NjMgMzYgMzQgMzMuMzEzNyAzNCAzMEMzNCAyNi42ODYzIDM2LjY4NjMgMjQgNDAgMjRaIiBmaWxsPSIjOEU5MEEwIi8+CjxwYXRoIGQ9Ik0xNiA1NkMxNiA1Mi42ODYzIDE4LjY4NjMgNTAgMjIgNTBINTguMDAwMUM2MS4zMTM4IDUwIDY0IDUyLjY4NjMgNjQgNTZWNjRIMTZWNjRWNjhWNTZaIiBmaWxsPSIjOEU5MEEwIi8+Cjwvc3ZnPgo=`;
                        }}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    >
                      <X size={10} />
                    </button>
                    
                    <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center ${
                      preview.type === 'new' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <Check size={8} className="text-white" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {preview.type === 'existing' ? 'Existing' : preview.name}
                    </div>
                  </div>
                ))}
                
                {canAddMore && (
                  <div
                    onClick={handleClick}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <Plus size={20} className="text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-600">Add More</span>
                    <span className="text-[10px] text-gray-400 mt-1">+{maxFiles - totalImages}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {totalImages} {totalImages === 1 ? 'image' : 'images'} selected
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="text-blue-600 dark:text-blue-400">{safeValue.existing.length} existing</span>
                      {' • '}
                      <span className="text-green-600 dark:text-green-400">{safeValue.new.length} new</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      canAddMore 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {canAddMore ? `${maxFiles - totalImages} remaining` : 'Limit reached'}
                    </span>
                  </div>
                </div>
              </div>

              {canAddMore && (
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={handleClick}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Upload size={14} />
                    Add More Images
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                {isDragging ? (
                  <Upload className="text-2xl text-blue-500 animate-bounce" />
                ) : (
                  <ImageIcon className="text-2xl text-gray-400" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  {isDragging ? '🎉 Drop images here!' : `Upload ${label}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag & drop or click to select multiple images
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
              >
                <Upload size={16} />
                Choose Files
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {required && !hasImages && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle size={14} />
          <span>⚠️ {label} is required</span>
        </div>
      )}
    </div>
  );
};