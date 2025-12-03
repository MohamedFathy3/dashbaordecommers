// components/orders/OrdersTable.tsx
'use client'

import { useState } from 'react'
import { Order } from '@/types/order'
import { CheckCircle, XCircle, Truck } from 'lucide-react'

interface OrdersTableProps {
  orders: Order[]
  onConfirmOrder?: (orderId: number) => Promise<{success: boolean, message: string}>
  onCancelOrder?: (orderId: number) => Promise<{success: boolean, message: string}>
  onDeliverOrder?: (orderId: number) => Promise<{success: boolean, message: string}>
}

export default function OrdersTable({ 
  orders, 
  onConfirmOrder, 
  onCancelOrder,
  onDeliverOrder 
}: OrdersTableProps) {
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleConfirm = async (orderId: number) => {
    if (onConfirmOrder) {
      setLoadingOrderId(orderId)
      const result = await onConfirmOrder(orderId)
      setLoadingOrderId(null)
      alert(result.message)
    }
  }

  const handleCancel = async (orderId: number) => {
    if (onCancelOrder) {
      setLoadingOrderId(orderId)
      const result = await onCancelOrder(orderId)
      setLoadingOrderId(null)
      alert(result.message)
    }
  }

  const handleDeliver = async (orderId: number) => {
    if (onDeliverOrder) {
      setLoadingOrderId(orderId)
      const result = await onDeliverOrder(orderId)
      setLoadingOrderId(null)
      alert(result.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      delivering: { color: 'bg-purple-100 text-purple-800', label: 'Delivering' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Order</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Customer</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Items</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-white">{order.order_number}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="text-gray-900 dark:text-white">{order.customer_name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  1 item<br />(1 product)
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.total_amount}
                </div>
              </td>
              <td className="py-4 px-4">
                {getStatusBadge(order.status)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      disabled={loadingOrderId === order.id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {loadingOrderId === order.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Confirm
                    </button>
                  )}
                  
                  {order.status === 'in_progress' && (
                    <button
                      onClick={() => handleDeliver(order.id)}
                      disabled={loadingOrderId === order.id}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {loadingOrderId === order.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      Deliver
                    </button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'in_progress') && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={loadingOrderId === order.id}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {loadingOrderId === order.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}