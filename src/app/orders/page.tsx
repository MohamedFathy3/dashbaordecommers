// app/orders/page.tsx
'use client';
import GenericDataManager from "@/components/Tablecomponents/GenericDataManager";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { Eye, } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: string;
  createdAt: string;
}

export default function OrdersPage() {
  // لم نعد بحاجة لهم، يمكن حذفهم أو تركهم لو مش عاملين تحذير
  // const [refreshKey, setRefreshKey] = useState(0);
  // const [ordersData, setOrdersData] = useState<Order[]>([]);

  const queryClient = useQueryClient(); // ✅ نستخدمه لعمل refetch بعد التغيير

  // دالة لتحديث حالة الطلب في الـ UI فوراً (اختياري تسيبها أو تحذفها)
  const updateOrderStatusInUI = useCallback((orderId: number, newStatus: string) => {
    // هنا لو عايز تعمل Optimistic UI على state محلي
  }, []);

    const router = useRouter();
  
        const handleViewUser = (userId: number) => {
      router.push(`/orders/${userId}`);
    };

  const handleStatusChange = async (orderId: number, currentStatus: string) => {
    try {
      const statusOptions = [
        { value: 'pending', label: '🟡 Pending' },
        { value: 'confirmed', label: '🟢 Confirmed' },
        { value: 'processing', label: '🔵 Processing' },
        { value: 'shipped', label: '🟣 Shipped' },
        { value: 'delivered', label: '✅ Delivered' },
        { value: 'cancelled', label: '❌ Cancelled' }
      ];

      const selectedStatus = await showStatusModal(statusOptions, currentStatus);
      if (!selectedStatus) return;

      // (اختياري) تحديث UI محلي
      updateOrderStatusInUI(orderId, selectedStatus);

      const response = await fetch(`/api/proxy/orders/change-status/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      if (!response.ok) {
        // رجّع الحالة القديمة لو فشل
        updateOrderStatusInUI(orderId, currentStatus);
        throw new Error('Failed to update status');
      }

      // ✅ بعد النجاح: اعمل ريفتش من السيرفر فوراً
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      showSuccessMessage(`Order status updated to ${selectedStatus}`);
    } catch (error) {
      console.error('Error changing order status:', error);
      alert('Failed to change order status');
    }
  };

  // دالة لمعالجة بيانات الـ orders عند جلبها
  const handleOrdersDataLoaded = useCallback((data: Order[]) => {
    // setOrdersData(data); // لم نعد بحاجة لهذا الـ state
  }, []);

  return (
    <GenericDataManager
      // key={refreshKey} // لم نعد نحتاجه لو بنستخدم invalidateQueries
      endpoint="orders"
      title="Orders"
      columns={[
        { 
          key: 'order_number', 
          label: 'Order Number', 
          sortable: true 
        },
        { 
          key: 'name', 
          label: 'Name', 
          sortable: true 
        },
     
        { 
          key: 'phone', 
          label: 'Phone', 
          sortable: true 
        },
        { 
          key: 'status', 
          label: 'Order Status', 
          sortable: true,
          render: (item) => (
            <OrderStatusCell 
              item={item as Order} 
              onStatusChange={handleStatusChange} 
            />
          ),
        },
        { 
          key: 'payment_method', 
          label: 'Payment Method', 
          sortable: true,
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.payment_method === 'card' 
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {item.payment_method === 'card' ? 'Credit Card' : 'Cash on Delivery'}
            </span>
          )
        },
        { 
          key: 'payment_status', 
          label: 'Payment Status', 
          sortable: true,
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.payment_status === '1' || item.payment_status === 'paid'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {item.payment_status === '1' || item.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          )
        },
        { 
          key: 'total_amount', 
          label: 'Total Amount', 
          sortable: true,
          render: (item) => (
            <span className="font-medium">
              ${item.total_amount ? parseFloat(item.total_amount).toFixed(2) : '0.00'}
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
      showDeleteButton={false}
      showBulkActions={false}
      showDeletedToggle={false}
      showActiveToggle= {false}

      availableFilters={[
        {
          key: 'order_number',
          label: 'Order Number',
          type: 'text',
          placeholder: 'Search by order number...'
        },
        {
          key: 'email',
          label: 'Email',
          type: 'text',
          placeholder: 'Search by email...'
        },
        {
          key: 'phone',
          label: 'Phone',
          type: 'text',
          placeholder: 'Search by phone...'
        },
        {
          key: 'status',
          label: 'Order Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        },
        {
          key: 'payment_method',
          label: 'Payment Method',
          type: 'select',
          options: [
            { value: 'card', label: 'Credit Card' },
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank Transfer' }
          ]
        },
        {
          key: 'payment_status',
          label: 'Payment Status',
          type: 'select',
          options: [
            { value: '0', label: 'Unpaid' },
            { value: '1', label: 'Paid' },
            { value: '2', label: 'Refunded' }
          ]
        },
      ]}
    />
  );
}

interface OrderStatusCellProps {
  item: Order;
  onStatusChange: (orderId: number, currentStatus: string) => void;
}

const OrderStatusCell = ({ item, onStatusChange }: OrderStatusCellProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    
    try {
      await onStatusChange(item.id, item.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        item.status === 'confirmed' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : item.status === 'processing'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          : item.status === 'shipped'
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          : item.status === 'cancelled'
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      } ${isUpdating ? 'opacity-50' : ''}`}>
        {isUpdating ? 'Updating...' : 
          item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Pending'
        }
      </span>
      
      {/* زر تغيير الحالة */}
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`p-1 transition-colors ${
          isUpdating 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-500 hover:text-blue-600'
        }`}
        title="Change Status"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

// ⭐⭐⭐ نافذة اختيار الحالة ⭐⭐⭐
const showStatusModal = (options: Array<{value: string, label: string}>, currentStatus: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-[90vw] mx-4">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Change Order Status</h3>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          ${options.map(option => `
            <button 
              class="w-full text-left p-3 rounded-lg border transition-colors dark:text-white ${
                option.value === currentStatus 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }"
              data-value="${option.value}"
            >
              ${option.label}
            </button>
          `).join('')}
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button 
            class="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded" 
            id="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const buttons = modal.querySelectorAll('button[data-value]');
    const cancelBtn = modal.querySelector('#cancel-btn');

    const cleanup = () => {
      document.body.removeChild(modal);
    };

    const handleButtonClick = (btn: Element) => {
      const value = btn.getAttribute('data-value');
      cleanup();
      resolve(value);
    };

    const handleCancel = () => {
      cleanup();
      resolve(null);
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', () => handleButtonClick(btn));
    });

    cancelBtn?.addEventListener('click', handleCancel);

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    modal.addEventListener('click', handleOutsideClick);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
  });
};

// ⭐⭐⭐ رسالة نجاح ⭐⭐⭐
const showSuccessMessage = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};