// app/orders/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";

export default function shippeng() {
    <GenericDataManager
      endpoint="countries-shipping"
      title="countries-shipping"
      columns={[
        { 
          key: 'name', 
          label: ' name', 
          sortable: true 
        },
        { 
          key: 'shipping_price', 
          label: 'shipping_price', 
          sortable: true 
        },
     
        { 
          key: 'currency', 
          label: 'currency', 
          sortable: true 
        },
        
      ]}
      
      formFields={[
        { 
          name: 'name', 
          label: 'name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter country name'
        },
        { 
          name: 'shipping_price', 
          label: 'shipping_price', 
          type: 'number', 
          required: true,
          placeholder: 'Enter shipping_price  number'
        },
        { 
          name: 'currency', 
          label: 'currency', 
          type: 'text', 
          required: true,
          placeholder: 'Enter  currency'
        },
       
      ]}
    />


}