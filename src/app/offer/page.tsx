'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";

export default function OffersPage() {
  return (
    <GenericDataManager
      endpoint="offers"
      title="Offers"
      columns={[
        { 
          key: 'id', 
          label: 'ID', 
          sortable: true,
          render: (item) => `OFF${String(item.id).padStart(3, '0')}`
        },
        { 
          key: 'title', 
          label: 'Title', 
          sortable: true 
        },
        { 
          key: 'product', 
          label: 'Product', 
          sortable: true,
          render: (item) => {
            // تأمين الوصول
            if (typeof item.product === 'string') return item.product;
            if (item.product && item.product.name) return item.product.name;
            if (item.product_id) return `Product #${item.product_id}`;
            return 'N/A';
          }
        },
        { 
          key: 'description', 
          label: 'Description', 
          sortable: false,
          render: (item) => (
            <div className="max-w-xs">
              {item.description ? (
                <span className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </span>
              ) : (
                <span className="text-sm text-gray-400">No description</span>
              )}
            </div>
          )
        },
        { 
          key: 'avatar', 
          label: 'Image', 
          sortable: false,
          render: (item) => 
            item.avatar ? (
              <img 
                src={item.avatar} 
                alt={item.title || 'Offer Image'}
                className="w-12 h-12 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )
        },
      ]}

      additionalData={[
        { key: 'products', endpoint: '/card' }
      ]}

      formFields={[
        { 
          name: 'title', 
          label: 'Offer Title', 
          type: 'text', 
          required: true,
          placeholder: 'Enter offer title'
        },
        {
          name: 'card_id',
          label: 'Product',
          type: 'select',
          optionsKey: 'products',
          required: true,
          placeholder: 'Select product',
        },
        { 
          name: 'description', 
          label: 'Description', 
          type: 'textarea', 
          required: false,
          placeholder: 'Enter offer description',
          rows: 4
        },
        { 
          name: 'avatar', 
          label: 'Offer Image', 
          type: 'file', 
          required: false,
          accept: 'image/*',
        }
      ]}

      showAddButton={true}
      showEditButton={false}
      showDeleteButton={true}
      showBulkActions={true}
      showDeletedToggle={true}
    />
  );
}
