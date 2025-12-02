// components/orders/OrdersTable.tsx
'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { OrdersResponse, Order, OrderStatusUpdate } from '@/types/order'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface OrdersTableProps {
  initialData?: OrdersResponse
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
  done: CheckCircle
}

export default function OrdersTable({ initialData }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialData?.data || [])
  const [loading, setLoading] = useState(!initialData)
  const [pagination, setPagination] = useState(initialData?.meta || {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 1,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [orderBy, setOrderBy] = useState('id')
  const [orderByDirection, setOrderByDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!initialData) {
      fetchOrders()
    }
  }, [])

  const fetchOrders = async (page = 1, status?: string, search?: string) => {
    try {
      setLoading(true)
      
      const payload = {
        filters: {
          ...(status && status !== 'all' && { status }),
          ...(search && search.trim() && { search: search.trim() })
        },
        orderBy: orderBy,
        orderByDirection: orderByDirection,
        perPage: 10,
        page: page,
        paginate: true
      }
      
      console.log('📤 Fetching orders with payload:', payload)
      
      const data: OrdersResponse = await apiFetch('/back/orders/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      console.log('📥 Orders data received:', data)
      
      if (data.data) {
        setOrders(data.data)
        setPagination(data.meta || {
          current_page: page,
          from: 1,
          last_page: 1,
          links: [],
          path: '',
          per_page: 10,
          to: data.data.length,
          total: data.data.length
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: OrderStatusUpdate['status']) => {
    try {
      const response = await apiFetch(`/orders/change-status/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.result === 'Success') {
        toast.success('Order status updated successfully')
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handlePageChange = (page: number) => {
    fetchOrders(page, statusFilter !== 'all' ? statusFilter : undefined, searchTerm)
  }

  const handleFilterChange = (status: string) => {
    setStatusFilter(status)
    fetchOrders(1, status !== 'all' ? status : undefined, searchTerm)
  }

  const handleSearch = () => {
    fetchOrders(1, statusFilter !== 'all' ? statusFilter : undefined, searchTerm)
  }

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrderByDirection('desc')
    }
    // Re-fetch with new sorting
    fetchOrders(pagination.current_page, statusFilter !== 'all' ? statusFilter : undefined, searchTerm)
  }

  // Calculate total items and unique products
  const calculateTotals = (order: Order) => {
    const totalItems = order.cards.reduce((sum, item) => sum + item.qty, 0)
    const uniqueProducts = order.cards.length
    return { totalItems, uniqueProducts }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Total {pagination?.total || 0} orders
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status]
              const { totalItems, uniqueProducts } = calculateTotals(order)
              const currency = order.cards[0]?.card?.currency || ''
              
              return (
                <tr 
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Order Details */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order.order_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="lg:hidden mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{order.name}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[180px]">{order.email}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3" />
                        <span>{order.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {totalItems} item{totalItems > 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({uniqueProducts} product{uniqueProducts > 1 ? 's' : ''})
                      </span>
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {order.total_amount} {currency}
                      </span>
                      {order.payment_type === 'installment' && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                          Installment
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{order.status}</span>
                      </div>
                      
                      {/* Quick Status Change */}
                      <div className="flex gap-1">
                        {order.status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'confirmed')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded"
                            title="Confirm Order"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* View Button */}
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {statusFilter !== 'all' 
              ? `No orders with status "${statusFilter}"`
              : 'No orders have been placed yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{pagination.from}</span> to{' '}
              <span className="font-medium">{pagination.to}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(pagination.last_page)].map((_, i) => {
                  const page = i + 1
                  const isCurrent = page === pagination.current_page
                  const showPage = 
                    page === 1 || 
                    page === pagination.last_page || 
                    (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                  
                  if (!showPage) {
                    if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                      return <span key={page} className="px-2 text-gray-500">...</span>
                    }
                    return null
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}