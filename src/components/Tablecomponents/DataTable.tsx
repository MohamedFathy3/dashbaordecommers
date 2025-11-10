// components/Tablecomponents/DataTable.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/Tablecomponents/Switch";
import { 
  ArrowUpDown, Mail, Phone, Globe, Building, 
  Users, Briefcase, Shield, Circle, User, Smartphone, Landmark, MapPin
} from "lucide-react";

// جعل الـ Interfaces أكثر مرونة
export interface BaseEntity {
  id: number;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  company?: any;
  active?: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ColumnDefinition<T = BaseEntity> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  links: any[];
}

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
  className?: string;
}

// جعل DataTable عاماً باستخدام Generics
export interface DataTableProps<T = BaseEntity> {
  title: string;
  data: T[];
  columns: ColumnDefinition<T>[];
  selectedItems: Set<number>;
  allSelected: boolean;
  someSelected: boolean;
  orderBy: string;
  orderByDirection: 'asc' | 'desc';
  pagination: PaginationMeta;
  onToggleSelectAll: () => void;
  onToggleSelectItem: (id: number) => void;
  onSort: (column: ColumnDefinition<T>) => void;
  onEdit: (item: T) => void;
  onDelete: (id: number, itemName: string) => void;
  onToggleActive?: (id: number, itemName: string, currentActive: boolean) => void;
  deleteLoading: boolean;
  Checkbox: React.FC<CheckboxProps>;
}

interface ExtendedDataTableProps<T = BaseEntity> extends DataTableProps<T> {
  showingDeleted?: boolean;
  onRestore?: (id: number, itemName: string) => void;
  onForceDelete?: (id: number, itemName: string) => void;
  compactView?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showActiveToggle?: boolean;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
}

// Default Checkbox Component
const DefaultCheckbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onChange, 
  indeterminate, 
  className 
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    ref={(el) => {
      if (el) {
        el.indeterminate = indeterminate || false;
      }
    }}
    className={className || "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"}
  />
);

// Icon Component
const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  const iconProps = { className: className || "w-3 h-3 flex-shrink-0" };
  
  switch (icon) {
    case 'mail': return <Mail {...iconProps} />;
    case 'phone': return <Phone {...iconProps} />;
    case 'smartphone': return <Smartphone {...iconProps} />;
    case 'map-pin': return <MapPin {...iconProps} />;
    case 'building': return <Building {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'briefcase': return <Briefcase {...iconProps} />;
    case 'globe': return <Globe {...iconProps} />;
    case 'shield': return <Shield {...iconProps} />;
    case 'landmark': return <Landmark {...iconProps} />;
    case 'user': return <User {...iconProps} />;
    default: return <Circle {...iconProps} />;
  }
};

// Main DataTable Component مع Generics
export function DataTable<T extends BaseEntity>({
  title, 
  data, 
  columns, 
  selectedItems, 
  allSelected, 
  someSelected,
  orderBy, 
  orderByDirection, 
  pagination, 
  onToggleSelectAll, 
  onToggleSelectItem,
  onSort, 
  onEdit, 
  onDelete, 
  onRestore, 
  onForceDelete, 
  onToggleActive, 
  deleteLoading, 
  Checkbox = DefaultCheckbox,
  showingDeleted = false,
  compactView = false,  
  showEditButton = true,
  showDeleteButton = true,
  showActiveToggle = true,
  perPage = 10,
  onPerPageChange,
}: ExtendedDataTableProps<T>) {
  
  // تحديد إذا كان هناك أي عمود صورة
  const imageFieldKeys = ['image', 'avatar', 'photo', 'picture', 'profile_image', 'logo'];
  const hasImageColumn = columns.some(col => imageFieldKeys.includes(col.key));
  
  // الحقول التي تظهر في العرض المدمج (فقط هذه)
  const compactDisplayFields = ['name', 'company', 'email', 'phone'];
  
  // الحصول على مفتاح الصورة الفعلي المستخدم في البيانات
  const getImageFieldKey = (item: T) => {
    return imageFieldKeys.find(key => item[key]) || 'image';
  };

  // الحصول على الصورة من العنصر
  const getItemImage = (item: T) => {
    const imageKey = getImageFieldKey(item);
    const imageValue = item[imageKey];
    
    if (!imageValue) return null;
    
    if (typeof imageValue === 'string') {
      return imageValue;
    }
    
    if (typeof imageValue === 'object' && imageValue.url) {
      return imageValue.url;
    }
    
    return null;
  };

  // الحصول على بيانات العرض المدمج من العنصر (فقط الحقول المطلوبة)
  const getCompactDisplayData = (item: T) => {
    const displayData = [];

    // الاسم (دائماً يظهر)
    if (item.name || item.title) {
      displayData.push({
        field: 'name',
        value: item.name || item.title || '',
        isTitle: true
      });
    }

    // الشركة (إذا كان object)
    if (item.company?.name) {
      displayData.push({
        field: 'company',
        value: item.company.name,
        icon: 'building',
        type: 'text'
      });
    } else if (item.company) {
      displayData.push({
        field: 'company',
        value: item.company,
        icon: 'building',
        type: 'text'
      });
    }

    // الإيميل
    if (item.email) {
      displayData.push({
        field: 'email',
        value: item.email,
        icon: 'mail',
        type: 'email'
      });
    }

    // الهاتف الأرضي
    if (item.phone) {
      displayData.push({
        field: 'phone',
        value: item.phone,
        icon: 'phone',
        type: 'phone'
      });
    }

    return displayData;
  };

  // الحصول على الحرف الأول للصورة البديلة
  const getInitial = (item: T) => {
    const name = item.name || item.title || 'Unknown';
    return name.charAt(0).toUpperCase();
  };

  // الحصول على الأعمدة للعرض في الجدول (كل الحقول ما عدا المدمجة)
  const getTableColumns = () => {
    if (!compactView) return columns;
    
    return columns.filter(col => 
      ![...imageFieldKeys, ...compactDisplayFields].includes(col.key)
    );
  };

  // دالة للحصول على القيمة من الحقول المتداخلة
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // دالة للتعامل مع الضغط المزدوج
  const handleDoubleClick = (item: T) => {
    onEdit(item);
  };

  // باقي الكود يبقى كما هو مع استبدال Entity بـ T
  return (
    <div className="w-full">
      {/* Container للجدول بدون ارتفاع ثابت */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Table Header */}
        <div className={`${
          showingDeleted
          ? "bg-red-100 dark:bg-red-800 text-red-400 dark:text-red-100 border-b border-red-200 dark:border-red-700"
          : "bg-gradient-to-r from-green-200 to-green-300 dark:from-green-900/30 dark:to-green-800/30 text-black dark:text-green-200 border-b border-green-100 dark:border-green-900/50"
        } font-semibold text-lg px-6 py-4`}>
          {title} Management {showingDeleted && "(Deleted Items)"}
        </div>

        {/* Table Info Bar */}
        <div className={`p-4 flex items-center justify-between ${
          showingDeleted ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"
        }`}>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${
              showingDeleted ? "text-red-600 dark:text-red-300" : "text-gray-600 dark:text-gray-400"
            }`}>
              Showing {data.length} of {pagination.total} items
              {showingDeleted && (
                <span className="text-red-500 ml-1">(Deleted)</span>
              )}
            </span>
            
            {/* Dropdown لتحديد عدد العناصر المعروضة */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
              <select 
                value={perPage}
                onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              showingDeleted ? "text-red-600 dark:text-red-300" : "text-gray-600 dark:text-gray-400"
            }`}>
              Sorted by:
            </span>
            <span className={`text-sm font-medium ${
              showingDeleted ? "text-red-700 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"
            }`}>
              {orderBy} ({orderByDirection})
            </span>
          </div>
        </div>

        {/* Table Container بدون اسكرل */}
        <div className="overflow-hidden">
          <table className={`w-full divide-y ${
            showingDeleted
            ? "divide-red-300 dark:divide-red-700"
            : "divide-gray-200 dark:divide-gray-700"
          }`}>
            <thead className="bg-gray-50 text-center dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4"
                  />
                </th>
                {compactView && hasImageColumn ? (
                  <>
                    {/* Compact Data Column */}
                    <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider min-w-[300px]">
                      Basic Info
                    </th>
                    {/* Regular Columns */}
                    {getTableColumns().map((column: ColumnDefinition<T>) => (
                      <th key={column.key} className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider min-w-[120px]">
                        <div 
                          className="flex items-center justify-center gap-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                          onClick={() => onSort(column)}
                        >
                          {column.label}
                          {column.sortable !== false && <ArrowUpDown className="w-4 h-4" />}
                        </div>
                      </th>
                    ))}
                  </>
                ) : (
                  // Normal View
                  columns.map((column: ColumnDefinition<T>) => (
                    <th key={column.key} className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider min-w-[120px]">
                      <div 
                        className="flex items-center justify-center gap-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                        onClick={() => onSort(column)}
                      >
                        {column.label}
                        {column.sortable !== false && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                  ))
                )}
                {/* إخفاء عمود الإجراءات إذا لم يكن هناك أي أزرار مسموح بها */}
                {(showEditButton || showDeleteButton || showActiveToggle) && (
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium uppercase tracking-wider min-w-[180px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white text-center dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.length ? (
                data.map((item: T) => {
                  const itemImage = getItemImage(item);
                  const compactData = getCompactDisplayData(item);
                  const shouldUseCompactView = compactView && hasImageColumn;
                  const itemName = item.name || item.title || 'Unknown';

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      onDoubleClick={() => showEditButton && handleDoubleClick(item)}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onChange={() => onToggleSelectItem(item.id)}
                          className="h-4 w-4"
                        />
                      </td>
                      
                      {shouldUseCompactView ? (
                        <>
                          {/* Compact Cell */}
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              {/* Image */}
                              <div className="flex-shrink-0">
                                {itemImage ? (
                                  <img 
                                    src={itemImage}
                                    alt={itemName}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <span className="text-white font-bold text-lg">
                                      {getInitial(item)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Basic Data */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="space-y-1">
                                  {compactData.map((data, index) => (
                                    <div key={index}>
                                      {data.isTitle ? (
                                        <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                          {data.value}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                          <IconComponent icon={data.icon || 'default-icon'} />
                                          <span className="truncate">{data.value}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Other Columns */}
                          {getTableColumns().map((column: ColumnDefinition<T>) => (
                            <td 
                              key={column.key} 
                              className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm"
                              onDoubleClick={() => showEditButton && handleDoubleClick(item)}
                            >
                              {column.render ? column.render(item) : getNestedValue(item, column.key)}
                            </td>
                          ))}
                        </>
                      ) : (
                        // Normal View
                        columns.map((column: ColumnDefinition<T>) => (
                          <td 
                            key={column.key} 
                            className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm"
                            onDoubleClick={() => showEditButton && handleDoubleClick(item)}
                          >
                            {column.render ? column.render(item) : getNestedValue(item, column.key)}
                          </td>
                        ))
                      )}
                      
                      {/* Actions Cell */}
                      {(showEditButton || showDeleteButton || showActiveToggle) && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-2">
                            {showingDeleted ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onRestore?.(item.id, itemName)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs"
                                >
                                  <i className="fas fa-rotate-left mr-1"></i>
                                  Restore
                                </Button>
                                {showDeleteButton && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onForceDelete?.(item.id, itemName)}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs"
                                  >
                                    <i className="fas fa-trash mr-1"></i>
                                    Delete
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {item.hasOwnProperty('active') && showActiveToggle && (
                                  <div className="flex items-center gap-1">
                                    <Switch
                                      checked={!!item.active}
                                      onChange={() => onToggleActive?.(item.id, itemName, !!item.active)}
                                    />
                                    <span className={`text-xs font-medium ${item.active ? 'text-green-600' : 'text-red-600'}`}>
                                      {item.active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                )}
                                
                                {showEditButton && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(item)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 text-xs"
                                  >
                                    <i className="fas fa-edit mr-1"></i>
                                    Edit
                                  </Button>
                                )}
                                
                                {showDeleteButton && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(item.id, itemName)}
                                    disabled={deleteLoading}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs"
                                  >
                                    {deleteLoading ? (
                                      <>
                                        <i className="fas fa-spinner fa-spin mr-1"></i>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-trash mr-1"></i>
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td 
                    colSpan={
                      columns.length + 
                      (compactView && hasImageColumn ? 2 : 1) + 
                      ((showEditButton || showDeleteButton || showActiveToggle) ? 1 : 0)
                    } 
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                      <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
                        No {title.toLowerCase()} found
                      </div>
                      <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {showingDeleted ? 'No deleted items available' : 'Get started by adding a new item'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DataTable;