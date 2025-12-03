// hooks/useGenericDataManager.ts
import { useState, FormEvent, useCallback, useEffect } from "react";
import { useQuery, useQueries, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from "@/lib/api";
import {
  Entity,
  PaginationMeta,
  ApiResponse,
  FilterPayload,
  GenericDataManagerProps,
  GenericDataManagerState,
  GenericDataManagerHandlers,
  SaveOptions,
} from "@/types/generic-data-manager";

interface AdditionalQueryResult {
  data?: unknown[];
  isLoading: boolean;
  error: Error | null;
}

export function useGenericDataManager({
  endpoint,
  additionalData = [],
  formFields = [],
  initialData = {},
  defaultFilters = {},
  initialPerPage = 10
}: GenericDataManagerProps): GenericDataManagerState & GenericDataManagerHandlers & {
  data: Entity[];
  pagination: PaginationMeta;
  isLoading: boolean;
  error: Error | null;
  additionalQueries: Record<string, AdditionalQueryResult>;
  saveItemMutation: UseMutationResult<unknown, Error, { data: Entity | FormData; isFormData?: boolean }>;
  deleteItemMutation: UseMutationResult<unknown, Error, { id: number; title: string }>;
  bulkDeleteMutation: UseMutationResult<unknown, Error, number[]>;
  bulkRestoreMutation: UseMutationResult<unknown, Error, number[]>;
  handleClearSearch: () => void;
  handleDeleteAll: () => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
} {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Entity | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showingDeleted, setShowingDeleted] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, string>>(defaultFilters);
  const [orderBy, setOrderBy] = useState<string>('id');
  const [orderByDirection, setOrderByDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [perPage, setPerPageState] = useState<number>(initialPerPage);

  // دالة لتغيير عدد العناصر المعروضة
  const handlePerPageChange = (newPerPage: number) => {
    setPerPageState(newPerPage);
    setCurrentPage(1); // الرجوع للصفحة الأولى عند تغيير عدد العناصر
  };

  // Additional queries section
  const additionalQueriesArray = useQueries({
    queries: additionalData.map(data => ({
      queryKey: [data.key, data.filters, 'static'],
      queryFn: async (): Promise<unknown[]> => {
        try {
          let json;
          if (data.filters && Object.keys(data.filters).length > 0) {
            const payload = {
              filters: data.filters,
              orderBy: "id",
              orderByDirection: "desc",
              perPage: 100,
              paginate: true,
              deleted: false
            };
            json = await apiFetch(`/back${data.endpoint}/index`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          } else {
            json = await apiFetch(`/back${data.endpoint}`);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (json && Array.isArray((json as any).data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (json as any).data;
          }
          if (Array.isArray(json)) {
            return json;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((json as any).items && Array.isArray((json as any).items)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (json as any).items;
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${data.endpoint}:`, error);
          return [];
        }
      },
      staleTime: 30 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }))
  });

  const additionalQueries = additionalData.reduce((acc, data, idx) => {
    acc[data.key] = additionalQueriesArray[idx];
    return acc;
  }, {} as Record<string, AdditionalQueryResult>);

  // Main data query (pagination + server-side filters)
  const { data: itemsData, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [endpoint, currentPage, showingDeleted, orderBy, orderByDirection, filters, defaultFilters, perPage],
    queryFn: async (): Promise<ApiResponse> => {
      const payload: FilterPayload = {
        filters: { ...defaultFilters, ...filters },
        orderBy,
        orderByDirection,
        perPage: perPage,
        page: currentPage,
        paginate: true,
        ...(showingDeleted && { deleted: true }),
      };

      const responseData = await apiFetch(`/back/${endpoint}/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((responseData as any).data && Array.isArray((responseData as any).data)) {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: (responseData as any).data,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: (responseData as any).meta || {
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            total: (responseData as any).data.length,
            links: []
          }
        };
      } else if (Array.isArray(responseData)) {
        return {
          data: responseData,
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            total: responseData.length,
            links: []
          }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((responseData as any).items && Array.isArray((responseData as any).items)) {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: (responseData as any).items,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: (responseData as any).meta || (responseData as any).pagination || {
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            total: (responseData as any).items.length,
            links: []
          }
        };
      } else {
        console.warn("Unexpected API response structure");
        return {
          data: [],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            total: 0,
            links: []
          }
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Data from API
  const data: Entity[] = itemsData?.data || [];
  const pagination: PaginationMeta = itemsData?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
    links: []
  };

  const handleForceDeleteSelected = async (): Promise<void> => {
    if (selectedItems.size === 0) return;
    
    const selectedIds = Array.from(selectedItems);
    const itemNames = data
      .filter(item => selectedItems.has(item.id))
      .map(item => item.name || item.title || `Item ${item.id}`)
      .join(', ');

    const message = `⚠️ Are you sure you want to PERMANENTLY delete ${selectedIds.length} selected item(s)?\n\n${itemNames}\n\nThis action cannot be undone!`;

    if (!confirm(message)) return;

    try {
      await apiFetch(`/back/${endpoint}/forceDelete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setSelectedItems(new Set());
      toast.success(`All ${selectedIds.length} items permanently deleted!`);
    } catch (error) {
      console.error("Error force deleting selected items:", error);
      toast.error("Error permanently deleting items");
    }
  };

  const handleFilter = (): void => {
    setCurrentPage(1);
  };

  const handleResetFilters = (): void => {
    setFilters({});
    setOrderBy('id');
    setOrderByDirection('desc');
    setCurrentPage(1);
    setShowFilter(false);
  };

  const handleSearch = useCallback((): void => {
    if (search.trim()) {
      setFilters(prev => ({ ...prev, search: search.trim() }));
    } else {
      const { search: _removed, ...rest } = filters;
      setFilters(rest);
    }
    setCurrentPage(1);
  }, [search, filters]);

  const handleClearSearch = (): void => {
    setSearch('');
    const { search: _removed, ...rest } = filters;
    setFilters(rest);
    setCurrentPage(1);
  };

  const handleToggleDeleted = (): void => {
    console.log('🎯 TOGGLE DELETED - Clearing selections');
    setSelectedItems(new Set());
    setShowingDeleted(prev => !prev);
    setCurrentPage(1);
    toast.success("View toggled successfully!");
  };

  useEffect(() => {
    if (selectedItems.size > 0) {
      console.log('🔄 AUTO-CLEAR on view change');
      setSelectedItems(new Set());
    }
  }, [showingDeleted]);

  const handleDeleteAll = (): void => {
    if (data.length === 0) return;
    const allIds = data.map(item => item.id);
    const titles = data.map(item => item.title || item.name || `Item ${item.id}`).join(', ');

    const message = showingDeleted
      ? `⚠️ Are you sure you want to PERMANENTLY delete all ${allIds.length} items?`
      : `Are you sure you want to delete all ${allIds.length} items: ${titles}?`;

    if (!confirm(message)) return;

    if (showingDeleted) {
      const promises = allIds.map(id => apiFetch(`/back/${endpoint}/forceDelete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is: [id] }),
      }));
      Promise.all(promises)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: [endpoint] });
          toast.success(`All ${allIds.length} items permanently deleted!`);
        })
        .catch(err => {
          console.error(err);
          toast.error("Error permanently deleting items");
        });
    } else {
      // use bulk delete mutation
      bulkDeleteMutation.mutate(allIds);
    }
  };

  // Save Mutation
  const saveItemMutation = useMutation<unknown, Error, { 
    data: Entity | FormData; 
    isFormData?: boolean;
    keepOpen?: boolean;
  }>({
    mutationFn: async ({ data: sendData, isFormData = false }) => {
      if (isFormData) {
        const formDataObj = sendData as FormData;
        if (editingItem?.id) {
          formDataObj.append('_method', 'PUT');
          return apiFetch(`/back/${endpoint}/${editingItem.id}`, {
            method: "POST",
            body: formDataObj,
          });
        } else {
          return apiFetch(`/back/${endpoint}`, {
            method: "POST",
            body: formDataObj,
          });
        }
      } else {
        const clean = sendData as Entity;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((clean as any).id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return apiFetch(`/back/${endpoint}/${(clean as any).id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clean),
          });
        } else {
          return apiFetch(`/back/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...initialData, ...clean }),
          });
        }
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      
      if (variables.keepOpen) {
        setFormData({});
        setEditingItem(null);
        toast.success(editingItem ? "Updated successfully!" : "Created successfully!");
        
        setTimeout(() => {
          const firstInput = document.querySelector('input, select, textarea') as HTMLElement;
          firstInput?.focus();
        }, 100);
      } else {
        setEditingItem(null);
        setFormData({});
        setOpen(false);
        toast.success(editingItem ? "Updated successfully!" : "Created successfully!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error saving item");
    }
  });

  const deleteItemMutation = useMutation<unknown, Error, { id: number; title: string }>({
    mutationFn: async ({ id }) => {
      return await apiFetch(`/back/${endpoint}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast.success('Deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteMutation = useMutation<unknown, Error, number[]>({
    mutationFn: async (ids: number[]) => {
      return await apiFetch(`/back/${endpoint}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids }),
      });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setSelectedItems(new Set());
      toast.success(`${vars.length} items deleted successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const bulkRestoreMutation = useMutation<unknown, Error, number[]>({
    mutationFn: async (ids: number[]) => {
      return await apiFetch(`/back/${endpoint}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids }),
      });
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setSelectedItems(new Set());
      toast.success(`${vars.length} items restored successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleToggleActive = async (id: number, itemName: string, currentActive: boolean): Promise<void> => {
    if (!confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} "${itemName}"?`)) {
      return;
    }
    try {
      await apiFetch(`/back/${endpoint}/${id}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast.success(`${currentActive ? 'Deactivated' : 'Activated'} successfully!`);
    } catch (error) {
      console.error(error);
      toast.error('Error updating status');
    }
  };

  const isFormEvent = (e: SaveOptions): e is FormEvent<HTMLFormElement> => {
    const event = e as FormEvent<HTMLFormElement>;
    return !!event?.preventDefault && typeof event.preventDefault === 'function';
  };


// hooks/useGenericDataManager.ts - الجزء اللي محتاج تعديل
const handleSave = async (e: SaveOptions): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let itemData: Record<string, any> = {};
  let keepOpen = false;
  let hasFiles = false;

  if (isFormEvent(e)) {
    e.preventDefault();
    keepOpen = false;
  } else {
    keepOpen = (e as { keepOpen?: boolean }).keepOpen || false;
  }

  itemData = { ...formData, ...initialData };

  if (editingItem?.id) {
    itemData.id = editingItem.id;
  }

  console.log('📸 Form data before processing:', itemData);

  // ✅ Check for files
  hasFiles = Object.values(itemData).some(v => 
    v instanceof File || 
    (v && typeof v === 'object' && Array.isArray(v)) ||
    (v && typeof v === 'object' && 'new' in v && Array.isArray(v.new))
  );

  const excludedKeys = ['createdAt', 'updatedAt', '_method'];
  Object.keys(itemData).forEach((key) => {
    if (excludedKeys.includes(key)) {
      delete itemData[key];
    }
  });

  let dataToSend: Entity | FormData;
  let isFormData = false;
  const isEditMode = !!editingItem?.id;

  console.log('🔄 Is Edit Mode:', isEditMode);
  console.log('📁 Has Files:', hasFiles);
  console.log('🎯 Should use FormData:', hasFiles || isEditMode);

  if (hasFiles || isEditMode) {
    const formDataObj = new FormData();
    
    console.log('🔍 Processing fields for FormData:');
    
    Object.entries(itemData).forEach(([key, value]) => {
      console.log(`  Field [${key}]:`, value, `Type:`, typeof value);
      
      // ✅ الحل: معالجة جميع أنواع البيانات بشكل صحيح
      if (value === null || value === undefined || value === '') {
        console.log(`  ⏭️ Skipping empty/null field [${key}]`);
        return;
      }
      
      // 1. Boolean values - إرسالها كـ "1" أو "0"
      if (typeof value === 'boolean') {
        console.log(`  🔘 Boolean field [${key}]:`, value);
        formDataObj.append(key, value ? '1' : '0');
        return;
      }
      
      // 2. Switch fields قد تأتي كـ string "true" أو "false" من الـ component
      if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        console.log(`  🔘 Switch field as string [${key}]:`, value);
        formDataObj.append(key, value === 'true' ? '1' : '0');
        return;
      }
      
      // 3. Images - معالجة خاصة
      if (key === 'image') {
        console.log(`  🖼️ Image field [${key}]:`, value);
        
        if (value instanceof File) {
          console.log(`    📄 Adding new image file:`, value.name);
          formDataObj.append('image', value);
        } else if (isEditMode && typeof value === 'string' && value.startsWith('http')) {
          // في وضع التعديل والصورة موجودة كـ URL، أرسل string فارغ
          console.log('    🔗 EDIT MODE - Image is URL, sending empty to preserve');
          formDataObj.append('image', '');
        } else if (value === '') {
          console.log('    🗑️ Image is empty string');
          formDataObj.append('image', '');
        }
        return;
      }
      
      // 4. Gallery - معالجة خاصة
      if (key === 'gallery') {
        console.log(`  🖼️ Gallery field [${key}]:`, value);
        
        if (value && typeof value === 'object') {
          // حالة Gallery object
          if ('new' in value && Array.isArray(value.new)) {
            const galleryValue = value as { existing: string[]; new: File[] };
            console.log(`    📁 Gallery has ${galleryValue.new.length} new files`);
            
            galleryValue.new.forEach((file: File, index: number) => {
              if (file instanceof File) {
                console.log(`      📄 Adding gallery file [${index}]:`, file.name);
                formDataObj.append(`gallery[${index}]`, file);
              }
            });
          } 
          // حالة Array مباشرة
          else if (Array.isArray(value)) {
            console.log(`    📁 Gallery as array with ${value.length} items`);
            value.forEach((item, index) => {
              if (item instanceof File) {
                console.log(`      📄 Adding gallery file [${index}]:`, item.name);
                formDataObj.append(`gallery[${index}]`, item);
              }
            });
          }
        }
        return;
      }
      
      // 5. Files
      if (value instanceof File) {
        console.log(`  📄 File field [${key}]:`, value.name);
        formDataObj.append(key, value);
        return;
      }
      
      // 6. Arrays (عامة)
      if (Array.isArray(value)) {
        console.log(`  📋 Array field [${key}] with ${value.length} items`);
        value.forEach((item, index) => {
          if (item instanceof File) {
            formDataObj.append(`${key}[${index}]`, item);
          } else if (item !== null && item !== undefined) {
            formDataObj.append(`${key}[${index}]`, String(item));
          }
        });
        return;
      }
      
      // 7. Numbers - إرسالها كـ string
      if (typeof value === 'number') {
        console.log(`  🔢 Number field [${key}]:`, value);
        formDataObj.append(key, String(value));
        return;
      }
      
      // 8. Strings والعادي
      console.log(`  📝 String/other field [${key}]:`, value);
      formDataObj.append(key, String(value));
    });
    
    // ✅ إضافة active لو مش موجودة (خاصة في وضع التعديل)
    if (!formDataObj.has('active') && 'active' in itemData) {
      const activeValue = itemData.active;
      console.log('⚠️ active field missing in FormData, adding:', activeValue);
      if (typeof activeValue === 'boolean') {
        formDataObj.append('active', activeValue ? '1' : '0');
      } else if (activeValue === 'true' || activeValue === true) {
        formDataObj.append('active', '1');
      } else {
        formDataObj.append('active', '0');
      }
    }
    
    const switchFields = ['free_delevery', 'one_year_warranty'];
    switchFields.forEach(field => {
      if (!formDataObj.has(field) && field in itemData) {
        const fieldValue = itemData[field];
        console.log(`⚠️ ${field} field missing in FormData, adding:`, fieldValue);
        if (typeof fieldValue === 'boolean') {
          formDataObj.append(field, fieldValue ? '1' : '0');
        } else if (fieldValue === 'true' || fieldValue === true) {
          formDataObj.append(field, '1');
        } else {
          formDataObj.append(field, '0');
        }
      }
    });
    
    // ✅ إضافة _method إذا كان تعديل
    if (isEditMode) {
      console.log('✏️ EDIT MODE - Added _method: PUT');
      formDataObj.append('_method', 'PUT');
    }
    
    // ✅ Log FormData للتأكد من كل الحقول
    console.log('📤 Final FormData entries:');
    for (const entry of formDataObj.entries()) {
      const [key, val] = entry;
      if (val instanceof File) {
        console.log(`  ${key}: File - ${val.name} (${val.type}, ${val.size} bytes)`);
      } else {
        console.log(`  ${key}: ${val}`);
      }
    }
    
    dataToSend = formDataObj;
    isFormData = true;
  } else {
    // ✅ معالجة البيانات بدون FormData (لـ Add فقط بدون ملفات)
    console.log('📤 Using JSON (no FormData)');
    
    const clean: Record<string, unknown> = {};
    Object.entries(itemData).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // ✅ معالجة Boolean للـ JSON
      if (typeof value === 'boolean') {
        clean[key] = value;
      } 
      // ✅ معالجة switch fields كـ strings
      else if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        clean[key] = value === 'true';
      }
      else {
        clean[key] = value;
      }
      
      console.log(`  ${key}:`, clean[key], `(type: ${typeof clean[key]})`);
    });
    
    dataToSend = clean as Entity;
  }

  console.log('🎯 Final data to send:', dataToSend);
  console.log('📦 Is FormData:', isFormData);
  console.log('🔄 Keep open:', keepOpen);

  saveItemMutation.mutate({ 
    data: dataToSend, 
    isFormData, 
    keepOpen 
  });
};
  const handleRestore = async (id: number, title: string): Promise<void> => {
    if (!confirm(`Are you sure you want to restore "${title}"?`)) return;

    try {
      await apiFetch(`/back/${endpoint}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [id] }),
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast.success(`"${title}" has been successfully restored!`);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while restoring the item.");
    }
  };

  const handleForceDelete = async (id: number, title: string): Promise<void> => {
    if (!confirm(`⚠️ Are you sure you want to permanently delete "${title}"? This action cannot be undone!`)) return;

    try {
      await apiFetch(`/back/${endpoint}/forceDelete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [id] }),
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast.success(`"${title}" has been permanently deleted!`);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while permanently deleting the item.");
    }
  };

return {
  // State
  search,
  setSearch,
  open,
  setOpen,
  editingItem,
  setEditingItem,
  currentPage,
  setCurrentPage,
  showFilter,
  setShowFilter,
  showingDeleted,
  setShowingDeleted,
  filters,
  setFilters,
  orderBy,
  setOrderBy,
  orderByDirection,
  setOrderByDirection,
  selectedItems,
  setSelectedItems,
  formData,
  setFormData,
  perPage,
  setPerPage: handlePerPageChange,

  // Data
  data,
  pagination,
  isLoading,
  error,
  additionalQueries,

  // Handlers
  handleForceDeleteSelected,
  handleSave,
  handleDelete: (id: number, title: string) => deleteItemMutation.mutate({ id, title }),
  handleBulkDelete: () => bulkDeleteMutation.mutate(Array.from(selectedItems)),
  handleBulkRestore: () => bulkRestoreMutation.mutate(Array.from(selectedItems)),
  handleFilter,
  handleDeleteAll,
  handleResetFilters,
  handleSearch,
  handleClearSearch,
  toggleSelectAll: () => {
    const pageIds = data.map(item => item.id);
    const allSel = pageIds.every(id => selectedItems.has(id));
    if (allSel) {
      const newSet = new Set(selectedItems);
      pageIds.forEach(id => newSet.delete(id));
      setSelectedItems(newSet);
    } else {
      const newSet = new Set(selectedItems);
      pageIds.forEach(id => newSet.add(id));
      setSelectedItems(newSet);
    }
  },
  toggleSelectItem: (id: number) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  },
  handleRestore,
  handleForceDelete,
  handleToggleActive,
  handleToggleDeleted, // ✅ أضف هذا السطر

  // Mutations
  saveItemMutation,
  deleteItemMutation,
  bulkDeleteMutation,
  bulkRestoreMutation,
};
}