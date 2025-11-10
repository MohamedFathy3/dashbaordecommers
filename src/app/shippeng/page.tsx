// app/orders/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";

export default function ShippingPage() {
  return (
    <GenericDataManager
      endpoint="countries-shipping"
      title="Shipping Countries"
      columns={[
        { 
          key: 'id', 
          label: 'ID', 
          sortable: true,
          render: (item) => `SHIP${String(item.id).padStart(3, '0')}`
        },
        { 
          key: 'name', 
          label: 'Country Name', 
          sortable: true 
        },
        { 
          key: 'shipping_price', 
          label: 'Shipping Price', 
          sortable: true,
          render: (item) => (
            <span className="font-semibold text-green-600">
              {item.shipping_price} {item.currency}
            </span>
          )
        },
        { 
          key: 'currency', 
          label: 'Currency', 
          sortable: true 
        },
        { 
          key: 'iso_code', 
          label: 'ISO Code', 
          sortable: true,
          render: (item) => item.iso_code || 'N/A'
        },
      ]}
      
      formFields={[
        { 
          name: 'name', 
          label: 'Country Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter country name'
        },
        { 
          name: 'iso_code', 
          label: 'ISO Code', 
          type: 'text', 
          required: false,
          placeholder: 'Enter ISO code (e.g., US, GB)'
        },
        { 
          name: 'shipping_price', 
          label: 'Shipping Price', 
          type: 'number', 
          required: true,
          placeholder: 'Enter shipping price',
        },
        { 
          name: 'currency', 
          label: 'Currency', 
          type: 'select', 
          required: true,
          placeholder: 'Select currency',
          options: [
            { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
            { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
            { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
            { value: 'JPY', label: '🇯🇵 Japanese Yen (JPY)' },
            { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
            { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
            { value: 'CHF', label: '🇨🇭 Swiss Franc (CHF)' },
            { value: 'CNY', label: '🇨🇳 Chinese Yuan (CNY)' },
            { value: 'AED', label: '🇦🇪 UAE Dirham (AED)' },
            { value: 'SAR', label: '🇸🇦 Saudi Riyal (SAR)' },
          ]
        },
      ]}

      showAddButton={true}
      showEditButton={true}
      showDeleteButton={true}
      showBulkActions={true}
      showDeletedToggle={true}
    />
  );
}