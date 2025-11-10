// components/Tablecomponents/ClassSelector.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';

// تعريف واجهة للفصل الدراسي
interface Class {
  id: number;
  name?: string;
  school_name?: string;
}

interface ClassSelectorProps {
  value: number[] | number | string;
  onChange: (value: number[] | number | string) => void;
  additionalQueries?: Record<string, { data?: unknown[] }>;
  label?: string;
  required?: boolean;
  multiple?: boolean;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  value,
  onChange,
  additionalQueries,
  label = "Assigned Classes",
  required = false,
  multiple = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const classesData = useMemo(() => {
    const data = additionalQueries?.['classe']?.data || [];
    return data.map(item => {
      if (item && typeof item === 'object' && 'id' in item) {
        return item as Class;
      }
      return { id: 0, name: 'Unknown Class' };
    });
  }, [additionalQueries]);

  const selectedValues = Array.isArray(value) 
    ? value 
    : value 
      ? [value].flat().map(v => typeof v === 'string' ? parseInt(v) : v)
      : [];

  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classesData;
    
    return classesData.filter((cls: Class) =>
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classesData, searchTerm]);

  const handleChange = (classId: number) => {
    if (multiple) {
      const newValues = selectedValues.includes(classId)
        ? selectedValues.filter(id => id !== classId)
        : [...selectedValues, classId];
      onChange(newValues);
    } else {
      onChange(classId);
    }
  };

  const clearSearch = () => setSearchTerm('');
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear ({selectedValues.length})
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 max-h-60 overflow-y-auto">
        {filteredClasses.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredClasses.map((cls: Class) => {
              const isSelected = selectedValues.includes(cls.id);
              return (
                <label 
                  key={cls.id} 
                  className={`
                    flex items-center p-3 cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-700
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={multiple ? "class_ids" : "class_id"}
                    value={cls.id}
                    checked={isSelected}
                    onChange={() => handleChange(cls.id)}
                    className="sr-only"
                  />
                  
                  <div className={`
                    flex items-center justify-center w-4 h-4 border rounded mr-3 flex-shrink-0
                    ${isSelected 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-400'
                    }
                    ${!multiple && 'rounded-full'}
                  `}>
                    {isSelected && (
                      multiple ? (
                        <Check size={12} />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {cls.name || `Class ${cls.id}`}
                    </div>
                    {cls.school_name && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {cls.school_name}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            {searchTerm ? 'No classes found' : 'No classes available'}
          </div>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Selected: {selectedValues.length} class{selectedValues.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
};