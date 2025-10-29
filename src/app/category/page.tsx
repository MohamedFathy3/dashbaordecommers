// app/categories/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";

export default function CategoriesPage() {
  return (
    <GenericDataManager
      endpoint="categories"
      title="Categories"
      columns={[
   
        { 
          key: 'name', 
          label: 'Name', 
          sortable: true 
        },
        { 
          key: 'slug', 
          label: 'Slug', 
          sortable: true 
        },
     
        
  { 
  key: 'image', 
  label: 'Image', 
  sortable: false,
  render: (item) => {
    // تحويل الصورة لـ string
    const imageSrc = typeof item.image === 'string' 
      ? item.image 
      : item.image instanceof Blob 
        ? URL.createObjectURL(item.image) 
        : undefined;

    return imageSrc ? (
      <img 
        src={imageSrc} 
        alt={item.name || 'Item image'}
        className="w-10 h-10 rounded-lg object-cover"
      />
    ) : (
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
},
        { 
          key: 'active', 
          label: 'Status', 
          sortable: true,
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.active 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {item.active ? 'Active' : 'Inactive'}
            </span>
          )
        },
     
      ]}
     
      // ⭐⭐⭐ حقول الإضافة والتعديل ⭐⭐⭐
      formFields={[
        { 
          name: 'name', 
          label: 'Category Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter category name'
        },
        { 
          name: 'slug', 
          label: 'Slug', 
          type: 'text', 
          required: false,
          placeholder: 'Enter category slug (auto-generated if empty)'
        },
     
        { 
          name: 'image', 
          label: 'Category Icon', 
          type: 'file', 
          required: false,
          accept: 'image/*',
        },
     
      ]}

      additionalData={[
        { 
          key: 'categories', 
          endpoint: '/categories',
        }
      ]}
     
      showAddButton={true}
      showEditButton={true}
      showDeleteButton={true}
      showBulkActions={true}
      showDeletedToggle={true}
      
      // ⭐⭐⭐ الفلترز المتاحة ⭐⭐⭐
      availableFilters={[
       
        
        {
          key: 'name',
          label: 'Category Name',
          type: 'text',
          placeholder: 'Search by category name...'
        },
        {
          key: 'slug',
          label: 'Slug',
          type: 'text',
          placeholder: 'Search by slug...'
        }
      ]}

    />
  );
}