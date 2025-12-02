// app/products/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";
import { MultiImageUploader } from "@/components/Tablecomponents/MultiImageUploader";
import { Eye, Search, Filter, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function ProductsPage() {
      const router = useRouter();

      const handleViewUser = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  return (
      <GenericDataManager
            endpoint="user"
            title=""
            columns={[
              { 
                key: 'id', 
                label: 'ID', 
                sortable: true,
                render: (item) => (
                  <span className="font-mono">US{String(item.id).padStart(3, '0')}</span>
                )
              },
              { 
                key: 'name', 
                label: 'Name', 
                sortable: true,
                render: (item) => (
                  <div className="flex items-center gap-3">
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {item.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{item.name || 'No Name'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.email}
                      </div>
                    </div>
                  </div>
                )
              },
          
            
              { 
                key: 'phone', 
                label: 'Phone', 
                sortable: true,
                render: (item) => item.phone || 'N/A'
              },
              { 
                key: 'orders', 
                label: 'Orders', 
                sortable: true,
                render: (item) => (
                  <span className="font-medium">
                    {item.orders?.length || 0}
                  </span>
                )
              },
          
              {
                key: 'actions',
                label: 'Actions',
                render: (item) => (
                  <button
                    onClick={() => handleViewUser(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      
                     'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                )
              }
            ]}
            showAddButton={false}
            showEditButton={false}
            showDeleteButton={true}
            showBulkActions={true}
            showDeletedToggle={true}
    />
  );
}