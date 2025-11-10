// components/GenericDataManager.tsx
"use client";

import React from 'react';
import MainLayout from "@/components/MainLayout";
import Pagination from "@/components/Tablecomponents/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Filter, ArrowUpDown, Image, Mail, MapPin, Phone, Globe, Building, 
  Users, Briefcase, Shield, Circle, User, Smartphone, Landmark
} from "lucide-react";
import { useGenericDataManager } from "@/hook/useGenericDataManager";
import FilterSearch from "@/components/Tablecomponents/FilterSearch/FilterSearch";
import { ImageUploader } from "@/components/Tablecomponents/ImageUpload";
import { MultiImageUploader } from "@/components/Tablecomponents/MultiImageUploader"; // إضافة المكون الجديد
import { Switch } from "@/components/Tablecomponents/Switch";
import FormModal from "@/components/Tablecomponents/FormModal";
import DataTable from "@/components/Tablecomponents/DataTable";
import { 
  GenericDataManagerProps, 
  CheckboxProps,
  HeaderProps,
  DataTableProps,
  FormModalProps,
  ColumnDefinition,
  Entity,
  SelectOption,
  PaginationMeta,
  FilterField,
  SaveOptions,
  FormField,
} from "@/types/generic-data-manager";

const defaultPagination: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 7,
  total: 0,
  links: []
};

// الدوال المساعدة المستقلة - برة الـ component
const isRelationField = (key: string): boolean => {
  const relationPatterns = ['_id$', 'Id$', '_by$', 'By$'];
  return relationPatterns.some(pattern => new RegExp(pattern).test(key));
};

const isBooleanField = (key: string): boolean => {
  const booleanFields = ['active', 'is_active', 'enabled', 'verified', 'status'];
  return booleanFields.includes(key);
};

const hasRelationData = (key: string, columns: ColumnDefinition[]): boolean => {
  const relationField = key.replace(/_id$/, '');
  return columns.some(col => col.key === relationField);
};

const getOptionsForRelationField = (
  fieldKey: string, 
  additionalQueries: Record<string, { data?: unknown[] }>,
  data: Entity[],
  columns: ColumnDefinition[]
): { value: string; label: string }[] => {
  let relationName: string;
  
  if (fieldKey.endsWith('_id')) {
    relationName = fieldKey.replace('_id', 's');
  } else {
    relationName = fieldKey + 's';
  }
  
  // جرب الـ additionalQueries أولاً
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryData = additionalQueries[relationName]?.data as any[];
  
  if (!Array.isArray(queryData) || queryData.length === 0) {
    const singularName = relationName.endsWith('s') ? relationName.slice(0, -1) : relationName;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryData = additionalQueries[singularName]?.data as any[];
  }
  
  if (Array.isArray(queryData) && queryData.length > 0) {
    return queryData.map(item => ({
      value: item.id.toString(),
      label: item.name || item.title || item.code || item.local_name || `Item ${item.id}`
    }));
  }

  // لو مفيش additional queries، استخرج من البيانات الموجودة
  const uniqueValues = new Set<string>();
  
  data.forEach(item => {
    // جرب الحقل العلائقي مباشرة (مثل company بدل company_id)
    const relationField = fieldKey.replace(/_id$/, '');
    const relationValue = item[relationField];
    
    if (relationValue) {
      if (typeof relationValue === 'object' && relationValue.name) {
        uniqueValues.add(relationValue.name);
      } else if (typeof relationValue === 'string') {
        uniqueValues.add(relationValue);
      }
    }
    
    // جرب الحقل الأصلي (مثل company_id)
    const originalValue = item[fieldKey];
    if (originalValue && typeof originalValue === 'string') {
      uniqueValues.add(originalValue);
    }
  });

  if (uniqueValues.size > 0) {
    return Array.from(uniqueValues).map(value => ({
      value: value.toLowerCase().replace(/\s+/g, '_'),
      label: value
    }));
  }

  return [];
};

// الدالة الرئيسية لإنشاء الفلاتر
const generateDynamicFilters = (
  columns: ColumnDefinition[],
  additionalQueries: Record<string, { data?: unknown[] }>,
  data: Entity[],
  additionalData: { key: string; endpoint: string }[] = []
): FilterField[] => {
  const dynamicFilters: FilterField[] = [];
  const addedFilters = new Set<string>();

  // فلتر البحث الأساسي - الاسم
  if (!addedFilters.has('name')) {
    dynamicFilters.push({
      key: 'name',
      label: 'Name',
      type: 'text' as const,
      placeholder: 'Search by name'
    });
    addedFilters.add('name');
  }

  // إضافة فلاتر من الـ columns
  columns.forEach(column => {
    const excludedKeys = [
      'id', 'actions', 'created_at', 'updated_at', 'deleted_at', 
      'image', 'avatar', 'photo', 'logo', 'local_name', 'phone', 
      'code', 'Status', 'fax', 'address', 'zip_code', 'alias_name', 
      'notes', 'mobile', 'phone_two', 'email','flag','imageUrl', 'gallery'
    ];
    
    if (!excludedKeys.includes(column.key) && 
        !addedFilters.has(column.key) &&
        column.key !== 'name') {
      
      if (isRelationField(column.key) || hasRelationData(column.key, columns)) {
        const baseFieldName = column.key.replace(/_id$/, '');
        if (!addedFilters.has(baseFieldName)) {
          const options = getOptionsForRelationField(column.key, additionalQueries, data, columns);
          if (options.length > 0) {
            dynamicFilters.push({
              key: column.key,
              label: column.label,
              type: 'select' as const,
              options: options
            });
            addedFilters.add(column.key);
          }
        }
      } else if (isBooleanField(column.key)) {
        dynamicFilters.push({
          key: column.key,
          label: column.label,
          type: 'select' as const,
          options: [
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]
        });
        addedFilters.add(column.key);
      } else {
        dynamicFilters.push({
          key: column.key,
          label: column.label,
          type: 'text' as const,
          placeholder: `Filter by ${column.label.toLowerCase()}`
        });
        addedFilters.add(column.key);
      }
    }
  });

  // إضافة فلاتر من الـ additionalData
  additionalData?.forEach(dataItem => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryData = additionalQueries[dataItem.key]?.data as any[];
    if (Array.isArray(queryData) && queryData.length > 0) {
      
      let fieldName: string;
      let label: string;
      
      if (dataItem.key.endsWith('s')) {
        fieldName = dataItem.key.replace('s', '_id');
        label = dataItem.key.charAt(0).toUpperCase() + dataItem.key.slice(1, -1);
      } else {
        fieldName = dataItem.key + '_id';
        label = dataItem.key.charAt(0).toUpperCase() + dataItem.key.slice(1);
      }
      
      if (!addedFilters.has(fieldName)) {
        dynamicFilters.push({
          key: fieldName,
          label: label,
          type: 'select' as const,
          options: queryData.map(item => ({
            value: item.id.toString(),
            label: item.name || item.title || item.code || `Item ${item.id}`
          }))
        });
        addedFilters.add(fieldName);
      }
    }
  });

  return dynamicFilters;
};

// دالة لمعالجة الحقول المخصصة في الـ formFields
const processFormFields = (formFields: FormField[]): FormField[] => {
  return formFields.map(field => {
    // إذا كان الحقل من نوع gallery، حوله لنوع custom مع المكون المناسب
    if (field.name === 'gallery' && field.type === 'file' && field.multiple) {
      return {
        ...field,
        type: 'custom' as const,
        component: MultiImageUploader,
        props: {
          maxFiles: field.maxFiles || 10,
          accept: field.accept || 'image/*',
          label: field.label || 'Product Gallery',
          required: field.required || false
        }
      };
    }
    
    // إذا كان حقل صورة عادي، استخدم ImageUploader
    if ((field.name === 'image' || field.name === 'avatar' || field.name === 'logo') && field.type === 'file') {
      return {
        ...field,
        type: 'custom' as const,
        component: ImageUploader,
        props: {
          accept: field.accept || 'image/*',
          label: field.label || 'Image',
          required: field.required || false
        }
      };
    }
    
    return field;
  });
};

export default function GenericDataManager(props: GenericDataManagerProps): React.ReactElement {
  const {
    // State
    search, setSearch,
    open, setOpen,
    editingItem, setEditingItem,
    currentPage, setCurrentPage,
    showFilter, setShowFilter,
    showingDeleted, setShowingDeleted,
    filters, setFilters,
    orderBy, setOrderBy,
    orderByDirection, setOrderByDirection,
    selectedItems, setSelectedItems,
    formData, setFormData,
    handleDeleteAll,
    // Data
    data,
    pagination,
    isLoading,
    additionalQueries,
    perPage, setPerPage,
    // Actions
    handleSave,
    handleDelete,
    handleBulkDelete,
    handleBulkRestore,
    handleFilter,
    handleResetFilters,
    handleSearch,
    handleClearSearch,
    toggleSelectAll,
    toggleSelectItem,
    handleRestore, 
    handleForceDelete, 
    handleToggleActive,
    // Mutations
    saveItemMutation,
    deleteItemMutation,
    bulkDeleteMutation,
    bulkRestoreMutation,
    handleForceDeleteSelected,
  } = useGenericDataManager(props);

  const { 
    title, 
    columns, 
    formFields = [],
    availableFilters = [],
    additionalData = [],
    onToggleActive,
    showAddButton = true,
    showEditButton = true,
    showDeleteButton = true,
    showActiveToggle = true,
    showSearch = true,
    showBulkActions = true,
    showDeletedToggle = true,
  } = props;

  console.log('🔍 GenericDataManager - formFields:', formFields);
  console.log('🔍 GenericDataManager - typeof formFields:', typeof formFields);
  console.log('🔍 GenericDataManager - Array.isArray(formFields):', Array.isArray(formFields));
  console.log('🔍 GenericDataManager - props:', props);

  // معالجة formFields لإضافة المكونات المخصصة
  const processedFormFields = React.useMemo(() => {
    return processFormFields(Array.isArray(formFields) ? formFields : []);
  }, [formFields]);

  // استخدام pagination آمن مع قيمة افتراضية
  const safePagination: PaginationMeta = pagination || defaultPagination;

  const finalAvailableFilters: FilterField[] = availableFilters.length > 0 
    ? availableFilters 
    : generateDynamicFilters(columns, additionalQueries, data, additionalData);

  // Checkbox Component
  const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, indeterminate, className }) => (
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

  const allSelected: boolean = data.length > 0 && data.every(item => selectedItems.has(item.id));
  const someSelected: boolean = data.some(item => selectedItems.has(item.id));

  const handleToggleFilter = (): void => {
    setShowFilter((prev: boolean) => !prev);
  };

  const handleToggleDeleted = (): void => {
    setShowingDeleted((prev: boolean) => !prev);
  };

  const handleAddItem = (): void => {
    setEditingItem(null);
    setFormData({});
    setOpen(true);
  };

  const handleEditItem = (item: Entity): void => {
    setEditingItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleSort = (column: ColumnDefinition): void => {
    if (column.sortable !== false) {
      if (orderBy === column.key) {
        setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setOrderBy(column.key);
        setOrderByDirection('asc');
      }
    }
  };

  const handleFiltersChange = (newFilters: Record<string, string>): void => {
    setFilters(newFilters);
  };

  const handleOrderByChange = (newOrderBy: string): void => {
    setOrderBy(newOrderBy);
  };

  const handleOrderByDirectionChange = (newDirection: 'asc' | 'desc'): void => {
    setOrderByDirection(newDirection);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormDataChange = (newFormData: Record<string, any>): void => {
    setFormData(newFormData);
  };

  const handleCloseModal = (): void => {
    setOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleItemToggleActive = (id: number, itemName: string, currentActive: boolean): void => {
    if (handleToggleActive) {
      handleToggleActive(id, itemName, currentActive);
    } else if (onToggleActive) {
      onToggleActive(id, itemName, currentActive);
    }
  };

  const hasManyFields = processedFormFields.length > 5;
  
  // تحديد إذا كان هناك حقول صور في البيانات لعرض التصميم المدمج
  const hasImageColumn = columns.some(col => 
    ['image', 'avatar', 'photo', 'picture', 'profile_image', 'logo'].includes(col.key)
  );

  // تحديد إذا كان هناك معرض صور
  const hasGalleryColumn = columns.some(col => col.key === 'gallery');
  
  // تحديد إذا كان هناك الحقول المطلوبة للعرض المدمج
  const hasRequiredCompactFields = columns.some(col => 
    ['name', 'company', 'email', 'phone'].includes(col.key)
  );

  // تفعيل العرض المدمج إذا كان هناك صورة والحقول المطلوبة
  const shouldUseCompactView = (hasImageColumn || hasGalleryColumn) && hasRequiredCompactFields;

  return (
    <MainLayout>
      <div className="space-y-6 p-6 pb-16 border-black rounded-lg min-h-screen">
        {/* Main Section - كل المكونات في سكشن واحد */}
        <div>
          {/* Header داخل السكشن */}
          <Header 
            title={title}
            dataLength={data.length} 
            onDeleteAll={handleDeleteAll} 
            currentPage={currentPage}
            pagination={safePagination}
            selectedItems={selectedItems}
            showingDeleted={showingDeleted}
            showFilter={showFilter}
            onForceDeleteSelected={handleForceDeleteSelected}
            searchTerm={filters.search}
            onBulkAction={showingDeleted ? handleBulkRestore : handleBulkDelete}
            onToggleFilter={handleToggleFilter}
            onToggleDeleted={handleToggleDeleted}
            onAddItem={handleAddItem}
            bulkLoading={bulkDeleteMutation.isPending || bulkRestoreMutation.isPending}
            showEditButton={showEditButton}
            showDeleteButton={showDeleteButton}
            showActiveToggle={showActiveToggle}
            showAddButton={showAddButton}
            showBulkActions={showBulkActions}
            showDeletedToggle={showDeletedToggle}
          />

          {/* Search & Filter داخل السكشن */}
          {(showSearch || showFilter) && (
            <div className="mt-6">
              <FilterSearch
                search={search}
                onSearchChange={setSearch}
                onSearch={handleSearch}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                orderBy={orderBy}
                onOrderByChange={handleOrderByChange}
                orderByDirection={orderByDirection}
                onOrderByDirectionChange={handleOrderByDirectionChange}
                onApplyFilter={handleFilter}
                onResetFilters={handleResetFilters}
                showFilter={showFilter}
                onToggleFilter={handleToggleFilter}
                availableFilters={finalAvailableFilters}
              />
            </div>
          )}

          {/* Table داخل السكشن */}
          <div className="mt-6">
            <DataTable
              title={title}
              data={data}
              columns={columns}
              selectedItems={selectedItems}
              allSelected={allSelected}
              someSelected={someSelected}
              orderBy={orderBy}
              orderByDirection={orderByDirection}
              pagination={safePagination}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelectItem={toggleSelectItem}
              onSort={handleSort}
              onEdit={handleEditItem}
              onDelete={handleDelete}
              onToggleActive={handleItemToggleActive}
              deleteLoading={deleteItemMutation.isPending}
              Checkbox={Checkbox}
              showingDeleted={showingDeleted}
              onRestore={handleRestore} 
              onForceDelete={handleForceDelete}
              compactView={shouldUseCompactView}
              showEditButton={showEditButton}
              showDeleteButton={showDeleteButton}
              showActiveToggle={showActiveToggle}
              perPage={perPage}  
              onPerPageChange={setPerPage} 
            />
          </div>

          {/* Pagination داخل السكشن */}
          <div className="mt-6">
            <Pagination
              currentPage={safePagination.current_page}
              lastPage={safePagination.last_page}
              total={safePagination.total}
              perPage={perPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Modal خارج السكشن الرئيسي */}
        {(showAddButton || showEditButton) && open && (
          <FormModal
            title={title}
            editingItem={editingItem}
            formFields={processedFormFields}
            formData={formData}
            additionalQueries={additionalQueries}
            onFormDataChange={handleFormDataChange}
            onSave={handleSave}
            onClose={handleCloseModal}
            saveLoading={saveItemMutation.isPending}
            compactLayout={hasManyFields}
          />
        )}
      </div>
    </MainLayout>
  );
}

interface ExtendedHeaderProps extends HeaderProps {
  showFilter: boolean;
  searchTerm?: string;
}

// Sub-components
const Header = ({ 
  title, currentPage, pagination, selectedItems, showingDeleted, showFilter, searchTerm,
  onBulkAction, onToggleFilter, onToggleDeleted, onAddItem, onDeleteAll, dataLength,
  bulkLoading,  
  showAddButton = true,
  showEditButton = true,
  showDeleteButton = true,
  showActiveToggle = true,
  showBulkActions = true,
  showDeletedToggle = true,
  onForceDeleteSelected,
}: ExtendedHeaderProps & { 
  onDeleteAll?: () => void; 
  dataLength: number;
}) => {
  const startItem = ((currentPage - 1) * pagination.per_page) + 1;
  const endItem = Math.min(currentPage * pagination.per_page, pagination.total);
  const totalItems = pagination.total;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Showing {startItem} to {endItem} of {totalItems} entries
          {searchTerm && (
            <span className="text-blue-600 dark:text-blue-400 ml-2">
              • Searching for: &quot;{searchTerm}&quot;
            </span>
          )}
        </p>
      </div>
     
      <div className="flex gap-3 flex-wrap">
        {/* Bulk Action Button - يظهر فقط لما يتم تحديد عناصر */}
        {selectedItems.size > 0 && showDeleteButton && showBulkActions && (
          <Button
            variant="destructive"
            onClick={onBulkAction}
            style={{color:'black'}}
            className={`
              relative
              overflow-hidden
              bg-gradient-to-r
              from-red-50
              to-red-100
              dark:from-red-900/30
              dark:to-red-800/30
              hover:from-red-100
              hover:to-red-200
              dark:hover:from-red-800/40
              dark:hover:to-red-700/40
              text-black
              dark:text-red-200
              font-semibold
              py-3
              px-6
              rounded-2xl
              shadow-md
              hover:shadow-lg
              transform
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all
              duration-250
              ease-in-out
              border
              border-red-100
              dark:border-red-900/50
              group
              ${bulkLoading ? 'opacity-70 cursor-wait' : ''}
            `}
            disabled={bulkLoading}
          >
            <span className="relative z-10 flex items-center gap-3">
              {bulkLoading ? (
                <i className="fas fa-spinner fa-spin text-sm"></i>
              ) : showingDeleted ? (
                <i className="fas fa-rotate-left group-hover:rotate-180 transition-transform duration-500"></i>
              ) : (
                <i className="fas fa-trash group-hover:scale-110 transition-transform duration-200"></i>
              )}
              {showingDeleted ? `Restore Selected (${selectedItems.size})` : `Delete Selected (${selectedItems.size})`}
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        )}

        {/* Force Delete Button */}
        {showingDeleted && selectedItems.size > 0 && (
          <Button
            style={{color:"#b91c1c"}}
            variant="destructive"
            onClick={onForceDeleteSelected}
            className={`
              relative
              overflow-hidden
              bg-gradient-to-r
              from-red-50
              to-red-100
              dark:from-red-900/30
              dark:to-red-800/30
              hover:from-red-100
              hover:to-red-200
              dark:hover:from-red-800/40
              dark:hover:to-red-700/40
              text-red-700
              dark:text-red-200
              font-semibold
              py-3
              px-6
              rounded-2xl
              shadow-md
              hover:shadow-lg
              transform
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all
              duration-250
              ease-in-out
              border
              border-red-100
              dark:border-red-900/50
              group
            `}
          >
            <span className="relative z-10 flex items-center gap-3">
              <i className="fas fa-fire text-red-600 group-hover:scale-110 transition-transform duration-200"></i>
              Force Delete Selected ({selectedItems.size})
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        )}

        {/* Toggle Deleted Button */}
        {showDeletedToggle && (
          <Button 
            onClick={onToggleDeleted} 
            className={`
              relative
              overflow-hidden
              bg-gradient-to-r
              from-red-50
              to-red-100
              dark:from-red-900/30
              dark:to-red-800/30
              hover:from-red-100
              hover:to-red-200
              dark:hover:from-red-800/40
              dark:hover:to-red-700/40
              text-black
              dark:text-red-200
              font-semibold
              py-3
              px-6
              rounded-2xl
              shadow-md
              hover:shadow-lg
              transform
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all
              duration-250
              ease-in-out
              border
              border-red-100
              dark:border-red-900/50
              group
            `}
          >
            <span className="flex items-center gap-3">
              {showingDeleted ? (
                <>
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <i className="fas fa-arrow-left text-red-600 dark:text-red-400 text-sm"></i>
                  </div>
                  <span className="text-red-700 dark:text-red-300">Back to Active Items</span>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:bg-red-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <i className="fas fa-trash-can text-red-600 dark:text-red-400 text-sm"></i>
                  </div>
                  <span className="text-black dark:text-red-300">Show Deleted Items</span>
                </>
              )}
            </span>
          </Button>
        )}

        {/* Add Button */}
        {showAddButton && !showingDeleted && (
          <Button
            className={`
              relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100
              dark:from-green-900/30 dark:to-green-800/30 hover:from-green-100 hover:to-green-200
              dark:hover:from-green-800/40 dark:hover:to-green-700/40 text-black dark:text-green-200
              font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5
              active:translate-y-0 transition-all duration-250 ease-in-out border border-green-100 dark:border-green-900/50 group
            `}
            onClick={onAddItem}
          >
            <span className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-plus text-green-600 dark:text-green-400 text-sm"></i>
              </div>
              <span className="text-black dark:text-green-300">Add {title}</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        )}
      </div>
    </div>
  );
};