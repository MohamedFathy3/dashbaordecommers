// app/DeliveryService/page.tsx
'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { apiFetch } from '@/lib/api'
import { 
  Package, 
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  ShoppingBag,
  RefreshCw,
  User,
  Mail,
  Phone,
  Eye,
  ChevronDown,
  Check,
  Search,
  Filter,
  Calendar,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface OrderItem {
  id: number
  card_id: number
  qty: number
  card: {
    id: number
    name: string
    price: string
    currency: string
    quantity: number
  }
}

interface Order {
  id: number
  name: string
  email: string
  apartment: string | null
  order_number: string
  phone: string
  address_line: string
  city: string
  state: string
  status: string
  zip_code: string
  payment_method: string
  payment_status: string
  promo_code: string | null
  payment_type: string
  installment_months: number | null
  increase_rate: number | null
  total_amount: string
  delivery_status: string
  delivery_name: string | null
  cards: OrderItem[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface OrdersResponse {
  data: Order[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
  result: string
  message: string
  status: number
}

interface OrderFilters {
  search?: string
  delivery_status?: string
  start_date?: string
  end_date?: string
}

interface OrdersPayload {
  filters: OrderFilters
  orderBy: string
  orderByDirection: string
  perPage: number
  paginate: number
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivering', label: 'Delivering', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivering', label: 'Delivering' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function DeliveryServicePage() {
  const { logout } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    averageOrder: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState<number | null>(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null)
  
  // فلترات وبحث
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // بناء payload مع الفلترات
      const payload: OrdersPayload = {
        filters: {},
        orderBy: "id",
        orderByDirection: "desc",
        perPage: 10,
        paginate: 1
      }
      
      // إضافة فلتر البحث
      if (filters.search) {
        payload.filters.search = filters.search
      }
      
      // إضافة فلتر الحالة
      if (filters.status && filters.status !== 'all') {
        payload.filters.delivery_status = filters.status
      }
      
      // إضافة فلتر التاريخ
      if (filters.startDate) {
        payload.filters.start_date = filters.startDate
      }
      if (filters.endDate) {
        payload.filters.end_date = filters.endDate
      }
      
      console.log('Payload:', payload)
      
      const response = await apiFetch('/back/orders/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }) as OrdersResponse
      
      if (response.data) {
        setOrders(response.data)
        
        // حساب الإحصائيات
        const totalOrders = response.meta?.total || 0
        
        const pendingOrders = response.data.filter(order => 
          order.delivery_status === 'pending' || order.delivery_status === 'in_progress'
        ).length
        
        const revenue = response.data.reduce((sum, order) => {
          const amount = parseFloat(order.total_amount || '0')
          return sum + (isNaN(amount) ? 0 : amount)
        }, 0)
        
        const averageOrder = response.data.length > 0 ? revenue / response.data.length : 0
        
        setStats({
          totalOrders,
          pendingOrders,
          revenue,
          averageOrder
        })
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Polling للبيانات الحية
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !selectedOrderDetails && !statusDropdownOpen) {
        fetchOrders()
      }
    }, 30000) // تحديث كل 30 ثانية

    return () => clearInterval(interval)
  }, [loading, selectedOrderDetails, statusDropdownOpen, fetchOrders])

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

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      setSelectedOrderId(orderId)
      
      // تحديث الحالة محلياً أولاً
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, delivery_status: status }
            : order
        )
      )
      
      // تحديث الإحصائيات محلياً
      if (status === 'pending' || status === 'in_progress') {
        setStats(prev => ({
          ...prev,
          pendingOrders: prev.pendingOrders + 1
        }))
      } else if (status === 'delivered' || status === 'cancelled') {
        setStats(prev => ({
          ...prev,
          pendingOrders: Math.max(0, prev.pendingOrders - 1)
        }))
      }
      
      // إغلاق dropdown تلقائياً
      setStatusDropdownOpen(null)
      
      // ثم تحديث على الخادم
      const response = await apiFetch(`/back/delivery/order/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.success) {
        // إذا فشل، نعيد تحميل البيانات للتأكد من المزامنة
        fetchOrders()
        throw new Error(response.message || 'Failed to update status')
      }
      
      return { success: true, message: 'Order status updated successfully' }
    } catch (err) {
      console.error('Failed to update order status:', err)
      // نعيد تحميل البيانات للتأكد من المزامنة
      fetchOrders()
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to update status' 
      }
    } finally {
      setSelectedOrderId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      delivering: { color: 'bg-purple-100 text-purple-800', label: 'Delivering' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      shipped: { color: 'bg-blue-100 text-blue-800', label: 'Shipped' },
      done: { color: 'bg-gray-100 text-gray-800', label: 'Done' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const toggleStatusDropdown = (orderId: number) => {
    setStatusDropdownOpen(statusDropdownOpen === orderId ? null : orderId)
  }

  const toggleOrderDetails = (order: Order) => {
    // في الهاتف نستخدم modal
    if (window.innerWidth < 768) {
      setSelectedOrderDetails(order)
    } else {
      // في الديسكتوب نستخدم expandable row
      setShowOrderDetails(showOrderDetails === order.id ? null : order.id)
    }
  }

  const openOrderDetailsModal = (order: Order) => {
    window.open(`/DeliveryService/${order.id}`, '_blank')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      startDate: '',
      endDate: ''
    })
    fetchOrders()
  }

  const getOrderDetails = (order: Order) => {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
            <p className="text-gray-900 dark:text-white">
              {order.address_line}, {order.city}, {order.state} {order.zip_code}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
            <p className="text-gray-900 dark:text-white">
              {order.payment_method} ({order.payment_type})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
            <p className="text-gray-900 dark:text-white">
              {order.apartment || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promo Code</p>
            <p className="text-gray-900 dark:text-white">
              {order.promo_code || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
            <p className="text-gray-900 dark:text-white">
              {order.payment_status === '1' ? 'Paid' : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Installment</p>
            <p className="text-gray-900 dark:text-white">
              {order.installment_months ? `${order.installment_months} months` : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items ({order.cards.length})</p>
          <div className="space-y-2">
            {order.cards.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.card.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qty: {item.qty} × {item.card.price} {item.card.currency}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Product #{item.card.id}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {(parseFloat(item.card.price) * item.qty).toFixed(2)} {item.card.currency}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
        
        </div>
      </div>
    )
  }

  const MobileOrderModal = () => {
    if (!selectedOrderDetails) return null
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-lg max-h-[90vh]">
            <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh]">
                {getOrderDetails(selectedOrderDetails)}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => openOrderDetailsModal(selectedOrderDetails)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // استخدام useMemo للبيانات المحسوبة
  const filteredOrders = useMemo(() => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return orders.filter(order => 
        order.order_number.toLowerCase().includes(search) ||
        order.name.toLowerCase().includes(search) ||
        order.email.toLowerCase().includes(search) ||
        order.phone.includes(search)
      )
    }
    return orders
  }, [orders, filters.search])

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="relative">
                <Truck className="h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Loading Delivery Dashboard</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Fetching your delivery data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Truck className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                  Delivery Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Manage and track delivery orders in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <ShoppingBag className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {stats.pendingOrders.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Needs attention
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    ${stats.revenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Total revenue
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Order</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    ${stats.averageOrder.toFixed(2)}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Average value
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <CreditCard className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="text-red-600 dark:text-red-400">⚠️</div>
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">Error Loading Data</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders List</h2>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 text-sm font-medium flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              
              {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, phone, or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Filter Orders</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {FILTER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? 'Applying...' : 'Apply Filters'}
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredOrders.length} of {stats.totalOrders} orders
            </p>
            
            {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Search: {filters.search}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Status: {FILTER_STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                  </span>
                )}
                {filters.startDate && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    From: {filters.startDate}
                  </span>
                )}
                {filters.endDate && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    To: {filters.endDate}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6">
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
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">{order.order_number}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{order.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">{order.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">{order.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {order.cards.length} item{order.cards.length !== 1 ? 's' : ''}
                            <br />
                            ({order.cards.reduce((sum, item) => sum + item.qty, 0)} products)
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {order.total_amount} {order.cards[0]?.card?.currency || 'USD'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <button
                              onClick={() => toggleStatusDropdown(order.id)}
                              disabled={selectedOrderId === order.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                            >
                              {getStatusBadge(order.delivery_status || order.status)}
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            
                            {statusDropdownOpen === order.id && (
                              <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                {STATUS_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => handleUpdateOrderStatus(order.id, option.value)}
                                    disabled={selectedOrderId === order.id}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                                      (order.delivery_status || order.status) === option.value 
                                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                                        : ''
                                    } ${selectedOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <span className={option.color.replace('100', '800').replace('bg-', 'text-')}>
                                      {option.label}
                                    </span>
                                    {(order.delivery_status || order.status) === option.value && (
                                      <Check className="h-4 w-4 text-green-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleOrderDetails(order)}
                              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showOrderDetails === order.id && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            {getOrderDetails(order)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {filters.search || filters.status !== 'all' || filters.startDate || filters.endDate
                      ? 'Try changing your filters'
                      : 'There are no orders at the moment.'}
                  </p>
                  {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Cards (Visible only on Mobile) */}
        <div className="block md:hidden">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{order.order_number}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                  </div>
                  {getStatusBadge(order.delivery_status || order.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{order.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{order.phone}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.total_amount} {order.cards[0]?.card?.currency || 'USD'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {order.cards.length} items
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleOrderDetails(order)}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                  <button
                    onClick={() => toggleStatusDropdown(order.id)}
                    disabled={selectedOrderId === order.id}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {selectedOrderId === order.id ? 'Updating...' : 'Status'}
                  </button>
                </div>
              </div>
              
              {statusDropdownOpen === order.id && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateOrderStatus(order.id, option.value)}
                        disabled={selectedOrderId === order.id}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          (order.delivery_status || order.status) === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        } ${selectedOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {filters.search || filters.status !== 'all' || filters.startDate || filters.endDate
                  ? 'Try changing your filters'
                  : 'There are no orders at the moment.'}
              </p>
              {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Modal */}
        <MobileOrderModal />
      </div>
    </div>
  )
}