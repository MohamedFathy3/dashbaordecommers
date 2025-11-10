// types/generic-data-manager.ts
import { UseMutationResult } from '@tanstack/react-query';
export type ModalType = 'simple' | 'tabs' | 'steps' | 'profile';
import { FormEvent } from 'react';
import { FC } from 'react';
import { MultiImageUploaderProps } from '@/components/Tablecomponents/MultiImageUploader';
import { ImageUploaderProps } from '@/components/Tablecomponents/ImageUpload';
export interface Entity {
  id: number;
  name: string;
  title?: string;
  image?: string | ImageData;
  email?: string;
  country?: string;
  active?: boolean;
  phone?: string;
  address?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; 
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface ApiResponse {
  data: Entity[];
  meta: PaginationMeta;
}

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
  className?: string;
}

export interface FilterPayload {
  filters: Record<string, string>;
  orderBy: string;
  orderByDirection: string;
  perPage: number;
  page: number;
  paginate: boolean;
  deleted?: boolean;
  search?: string;
}

export interface Device extends Entity {
  id: number;
  serialNumber: string;
  type: string;
  active: boolean;
  image?: string | ImageData;
  purchaseDateFormatted: string;
  memory?: { size: number; type: string };
  cpu?: { name: string };
  brand?: { name: string };
  deviceModel?: { name: string };
  brandId?: number;
  deviceModelId?: number;
  cpuId?: number;
  memoryId?: number;
}

export interface GenericDataManagerProps {
  endpoint: string;
  title: string;
  columns: ColumnDefinition[];
  additionalData?: AdditionalData[];
  formFields?: FormField[];
  availableFilters?: FilterField[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any>;
  defaultFilters?: Record<string, string>;
  onToggleActive?: (id: number, itemName: string, currentActive: boolean) => void;
    modalType?: ModalType;
  fieldCategories?: {
    [key: string]: string[]; 
  };
  showAddButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showActiveToggle?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showBulkActions?: boolean;
  showDeletedToggle?: boolean;
   initialPerPage?: number
  
}

export interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: Entity) => React.ReactNode;
}

export interface AdditionalData {
  key: string;
  endpoint: string;
  filters?: Record<string, string | number | boolean>;
}

export interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentImage?: string;
  className?: string;
  multiple?: boolean;
  accept?: string;
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export interface ImageData {
  id: number;
  url: string;
  thumbnail?: string;
  alt?: string;
}


export type CustomComponent = 
  | 'checkbox-group' 
  | 'time-selector' 
  | 'MultiImageUploader'
  | FC<MultiImageUploaderProps>
  | FC<ImageUploaderProps>;


export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'email' | 'password' | 'date' | 'datetime-local' | 'time' | 'switch' | 'textarea' | 'file' | 'tel' | 'url' | 'checkbox' | 'custom';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  optionsKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: string | ((formData: Record<string, any>) => string);
  multiple?: boolean;
  maxFiles?: number; // إضافة هذا الحقل
  accept?: string;
  placeholder?: string;
  rows?: number;
  component?: CustomComponent; // تحديث النوع
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>; // إضافة props للمكونات المخصصة
}

export interface MutationResult {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface GenericDataManagerState {
  search: string;
  open: boolean;
  editingItem: Entity | null;
  currentPage: number;
  showFilter: boolean;
  showingDeleted: boolean;
  filters: Record<string, string>;
  orderBy: string;
  orderByDirection: 'asc' | 'desc';
  selectedItems: Set<number>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>;
  defaultFilters?: Record<string, string>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingItem: React.Dispatch<React.SetStateAction<Entity | null>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setShowingDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setOrderByDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<number>>>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setPerPage: (perPage: number) => void;
}

export type SaveOptions = 
  | { keepOpen?: boolean }
  | FormEvent;

// دالة مساعدة محسنة للتحقق من النوع
export const isFormEvent = (e: SaveOptions): e is FormEvent => {
  return !!(e as FormEvent)?.preventDefault;
};

export interface GenericDataManagerHandlers {
  handleSave: (e: SaveOptions) => Promise<void>;
  handleDelete: (id: number, title: string) => void;
  handleBulkDelete: () => void;
  handleBulkRestore: () => void;
  handleFilter: () => void;
  handleResetFilters: () => void;
   handleDeleteAll: () => void;
  handleSearch: () => void;
  handleClearSearch: () => void;
  toggleSelectAll: () => void;
  toggleSelectItem: (id: number) => void;
  handleRestore: (id: number, itemName: string) => void;
  handleForceDelete: (id: number, itemName: string) => void;
  handleToggleActive?: (id: number, itemName: string, currentActive: boolean) => void;
  handleToggleDeleted: () => void;

    handleForceDeleteSelected: () => void;

}

export interface FormFieldProps {
  field: FormField;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  additionalQueries: Record<string, unknown>;
  onAddNewItem?: (fieldName: string) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: Record<string, any>;
  compact?: boolean;
  
}

export interface FormModalProps {
  title: string;
  editingItem: Entity | null;
  formFields: FormField[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>;
  additionalQueries: Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFormDataChange: (formData: Record<string, any>) => void;
onSave: (e: SaveOptions) => void;
  onClose: () => void;
  saveLoading: boolean;
  onAddNewItem?: (fieldName: string) => void;
  compactLayout?: boolean;
  
}

export interface FilterSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  onSearch: () => void;
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  orderBy: string;
  onOrderByChange: (orderBy: string) => void;
  orderByDirection: 'asc' | 'desc';
  onOrderByDirectionChange: (direction: 'asc' | 'desc') => void;
  onApplyFilter: () => void;
  onResetFilters: () => void;
  showFilter: boolean;
  onToggleFilter: () => void;
    showSearch?: boolean;
  showFilterSection?: boolean;
  availableFilters?: FilterField[];
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface HeaderProps {
  title: string;
  currentPage: number;
  pagination: PaginationMeta;
  selectedItems: Set<number>;
  showingDeleted: boolean;
  onBulkAction: () => void;
  onToggleFilter: () => void;
  onToggleDeleted: () => void;
  onAddItem: () => void;
  bulkLoading: boolean;
  showFilter: boolean;
  searchTerm?: string;
    showAddButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showActiveToggle?: boolean;
  showBulkActions?: boolean;
  showDeletedToggle?: boolean;
    onForceDeleteSelected?: () => void;

}

export interface SearchBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  onSearch: () => void;
}

export interface FilterSectionProps {
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  orderBy: string;
  onOrderByChange: (orderBy: string) => void;
  orderByDirection: 'asc' | 'desc';
  onOrderByDirectionChange: (direction: 'asc' | 'desc') => void;
  onApplyFilter: () => void;
  onResetFilters: () => void;
}

export interface DataTableProps {
  title: string;
  data: Entity[];
  columns: ColumnDefinition[];
  selectedItems: Set<number>;
  allSelected: boolean;
  someSelected: boolean;
  orderBy: string;
  orderByDirection: 'asc' | 'desc';
  pagination: PaginationMeta;
  onPerPageChange?: (perPage: number) => void;
      perPage?: number; // إضافة

  onToggleSelectAll: () => void;
  onToggleSelectItem: (id: number) => void;
  onSort: (column: ColumnDefinition) => void;
  onEdit: (item: Entity) => void;
  onDelete: (id: number, title: string) => void;
  onToggleActive?: (id: number, itemName: string, currentActive: boolean) => void;
  deleteLoading: boolean;
  Checkbox: React.ComponentType<CheckboxProps>;
  showingDeleted?: boolean;
  onRestore?: (id: number, itemName: string) => void; 
  onForceDelete?: (id: number, itemName: string) => void;
  compactView?: boolean;
    showEditButton?: boolean;
  showDeleteButton?: boolean;
  showActiveToggle?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
}