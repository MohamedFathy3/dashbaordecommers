// components/Tablecomponents/ImageUploader.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

export interface ImageUploaderProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  compact?: boolean;
  isEditing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Image",
  required = false,
  multiple = false,
  accept = "image/png, image/jpg, image/jpeg, image/svg+xml",
  maxSize = 5 * 1024 * 1024,
  compact = false,
  isEditing = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasNewFile, setHasNewFile] = useState(false); // 🔥 جديد
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تنظيف الـ URLs
  useEffect(() => {
    return () => {
      if (previewUrl && hasNewFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, hasNewFile]);

  // معالجة الصورة الحالية
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      setHasNewFile(true);
    } else if (typeof value === 'string') {
      setPreviewUrl(value);
      setHasNewFile(false);
    } else {
      setPreviewUrl(null);
      setHasNewFile(false);
    }
  }, [value]);

  // التحقق من الملف
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

    return true;
  };

// 🔥 معدل: معالجة اختيار الملف
const handleFileChange = (file: File | null) => {
  console.log('🖼️ File change:', file);
  
  if (file) {
    if (validateFile(file)) {
      onChange(file); // 🔥 إرسال الـ File object للصورة الجديدة
      setHasNewFile(true);
    }
  } else {
    // 🔥 معدل: عندما يتم مسح الصورة
    if (isEditing) {
      // في وضع التعديل، أرسل null لحذف الصورة الحالية
      onChange(null);
    } else {
      onChange(null);
    }
    setHasNewFile(false);
    setError(null);
  }
};
  // معالجة الـ drag and drop
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileName = () => {
    if (value instanceof File) {
      return value.name;
    }
    return previewUrl ? 'Current Image' : null;
  };

  const fileName = getFileName();
  const hasImage = previewUrl;
  const isCurrentImage = isEditing && typeof value === 'string' && !hasNewFile;

  return (
    <div className={`space-y-4 ${compact ? "col-span-2" : ""}`}>
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {hasImage && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Remove
          </button>
        )}
      </div>

      {/* منطقة الرفع */}
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
          ${hasImage ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          accept={accept}
          className="hidden"
        />

        <div className="text-center">
          {hasImage ? (
            <div className="space-y-4">
              {/* معاينة الصورة */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-xl object-cover border-2 border-white shadow-lg"
                  />
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                    hasNewFile ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              </div>
              
              {/* معلومات الصورة */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isCurrentImage ? "Current Image" : "New Image"}
                    </p>
                    {fileName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {fileName}
                      </p>
                    )}
                  </div>
                  {hasNewFile && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={handleClick}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload size={14} />
                  Change Image
                </button>
              </div>
            </div>
          ) : (
            /* حالة عدم وجود صورة */
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
                  {isDragging ? 'Drop image here' : `Upload ${label}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Drag & drop or click to select
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {accept} • Max {maxSize / (1024 * 1024)}MB
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Upload size={16} />
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>✓ Supports: {accept}</p>
        <p>✓ Maximum size: {maxSize / (1024 * 1024)}MB</p>
        {isEditing && (
          <p>💡 Leave empty to keep current image</p>
        )}
      </div>

      {/* حالة الإجباري */}
      {required && !hasImage && (
        <div className="text-sm text-red-500 flex items-center gap-2">
          <AlertCircle size={14} />
          ⚠️ {label} is required
        </div>
      )}
    </div>
  );
};