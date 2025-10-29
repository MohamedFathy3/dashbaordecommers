// app/products/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  return (
    <GenericDataManager
      endpoint="card"
      title="Products"
      columns={[
        { 
          key: 'id', 
          label: 'ID', 
          sortable: true,
          render: (item) => `PR${String(item.id).padStart(3, '0')}`
        },
        { 
          key: 'name', 
          label: 'Product Name', 
          sortable: true 
        },
        { 
          key: 'price', 
          label: 'Price', 
          sortable: true,
          render: (item) => `${item.currency || 'EGP'} ${item.price}`
        },
        { 
          key: 'discount', 
          label: 'Discount', 
          sortable: true,
          render: (item) => item.discount ? `${item.discount}%` : 'No Discount'
        },
        { 
          key: 'old_price', 
          label: 'Old Price', 
          sortable: true,
          render: (item) => `${item.currency || 'EGP'} ${item.old_price}`
        },
        { 
          key: 'quantity', 
          label: 'Quantity', 
          sortable: true,
          render: (item) => item.quantity || 0
        },
        { 
          key: 'category', 
          label: 'Category', 
          sortable: true 
        },
        // Gallery preview column
        { 
          key: 'gallery', 
          label: 'Gallery', 
          sortable: false,
          render: (item) => {
            const gallery = item.gallery || [];
            if (gallery.length === 0) return 'No images';
            return (
              <div className="flex items-center gap-1">
                <span className="text-sm">{gallery.length} images</span>
                {gallery[0] && (
                  <img 
                    src={gallery[0]} 
                    alt="Preview" 
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
              </div>
            );
          }
        },
      ]}

      additionalData={[
        { key: 'categories', endpoint: '/categories' },
      ]}
      
      formFields={[
        { 
          name: 'name', 
          label: 'Product Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter product name'
        },
        { 
          name: 'slug', 
          label: 'Slug', 
          type: 'text', 
          required: false,
          placeholder: 'Enter product slug'
        },
        { 
          name: 'type', 
          label: 'Type', 
          type: 'text', 
          required: false,
          placeholder: 'Enter product type'
        },

        // Pricing
        { 
          name: 'price', 
          label: 'Price', 
          type: 'number', 
          required: true,
          placeholder: 'Enter price',
        },
        { 
          name: 'old_price', 
          label: 'Old Price', 
          type: 'number', 
          required: false,
          placeholder: 'Enter old price',
        },
        { 
          name: 'discount', 
          label: 'Discount (%)', 
          type: 'text', 
          required: false,
          placeholder: 'Enter discount percentage',
        },
        { 
          name: 'currency', 
          label: 'Currency', 
          type: 'select', 
          required: false,
          options: [
            { value: 'EGP', label: 'EGP' },
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' }
          ],
          defaultValue: 'EGP'
        },

        // Inventory
        { 
          name: 'quantity', 
          label: 'Quantity', 
          type: 'number', 
          required: true,
          placeholder: 'Enter quantity',
        },
        { 
          name: 'item_number', 
          label: 'Item Number', 
          type: 'text', 
          required: false,
          placeholder: 'Enter item number'
        },

        // Category
        {
          name: 'category_id',
          label: 'Category',
          type: 'select',
          optionsKey: 'categories',
          required: true,
          placeholder: 'Select category',
        },

        // Product Specifications
        { 
          name: 'type_silicone', 
          label: 'Silicone Type', 
          type: 'text', 
          required: false,
          placeholder: 'Enter silicone type'
        },
        { 
          name: 'hardness', 
          label: 'Hardness', 
          type: 'text', 
          required: false,
          placeholder: 'Enter hardness'
        },
        { 
          name: 'bio', 
          label: 'Bio', 
          type: 'text', 
          required: false,
          placeholder: 'Enter bio information'
        },
        { 
          name: 'time_in_ear', 
          label: 'Time in Ear', 
          type: 'text', 
          required: false,
          placeholder: 'Enter time in ear'
        },
        { 
          name: 'end_curing', 
          label: 'End Curing', 
          type: 'text', 
          required: false,
          placeholder: 'Enter end curing'
        },
        { 
          name: 'viscosity', 
          label: 'Viscosity', 
          type: 'text', 
          required: false,
          placeholder: 'Enter viscosity'
        },
        { 
          name: 'color', 
          label: 'Color', 
          type: 'text', 
          required: false,
          placeholder: 'Enter color'
        },
        { 
          name: 'packaging', 
          label: 'Packaging', 
          type: 'text', 
          required: false,
          placeholder: 'Enter packaging'
        },

        // Mixing Information
        { 
          name: 'mix_gun', 
          label: 'Mix Gun', 
          type: 'text', 
          required: false,
          placeholder: 'Enter mix gun'
        },
        { 
          name: 'mix_canules', 
          label: 'Mix Canules', 
          type: 'text', 
          required: false,
          placeholder: 'Enter mix canules'
        },

        // Descriptions
        { 
          name: 'description', 
          label: 'Description', 
          type: 'textarea', 
          required: false,
          placeholder: 'Enter product description',
          rows: 4
        },
        { 
          name: 'short_description', 
          label: 'Short Description', 
          type: 'textarea', 
          required: false,
          placeholder: 'Enter short description',
          rows: 2
        },

        // Media & Links
        { 
          name: 'link_video', 
          label: 'Video Link', 
          type: 'url', 
          required: false,
          placeholder: 'Enter video URL'
        },
        
        // Gallery instead of single image
        { 
          name: 'gallery', 
          label: 'Product Gallery', 
          type: 'file', 
          required: false,
          accept: 'image/*',
          multiple: true, // علشان ترفع أكتر من صورة
        },

        // Status
        { 
          name: 'active', 
          label: 'Status', 
          type: 'switch', 
          required: false,
        }
      ]}

      showAddButton={true}
      showEditButton={true}
      showDeleteButton={true}
      showBulkActions={true}
      showDeletedToggle={true}
    />
  );
}