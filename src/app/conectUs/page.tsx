// app/rents/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";
import { useRouter } from "next/navigation";

export default function RentsPage() {
  const router = useRouter();

  return (
    <GenericDataManager
      endpoint="contacts"
      title="contacts"
      columns={[
       
        { 
          key: 'name', 
          label: 'Name', 
          sortable: true 
        },
        { 
          key: 'email', 
          label: 'Email', 
          sortable: true 
        },
        { 
          key: 'phone', 
          label: 'Phone', 
          sortable: true 
        },
        { 
          key: 'message', 
          label: 'Message', 
          sortable: false 
        },
   
  

      
       
     
      ]}

      
     showAddButton={false}
      showEditButton={false}
      showDeleteButton={false}
      showBulkActions={false}
      showDeletedToggle={false}
      
      // الفلترز المتاحة
      availableFilters={[]}
    />
  );
}