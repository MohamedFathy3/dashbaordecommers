// app/delivery/order/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { 
  ArrowLeft, 
  Package, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  User,
  Truck,
  CheckCircle,
  XCircle,
  Printer,
  Download,
  Info,
  Star,
  Shield,
  Tag,
  Percent,
  Image as ImageIcon,
  Video,
  Layers,
  Palette,
  Clock,
  TrendingUp,
  Hash,
  Globe,
  Award,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Check,
  ShoppingCart,
  ExternalLink,
  PackageOpen,
  FileText,
  Percent as PercentIcon,
  Navigation,
  Home,
  Box,
  CreditCard as CreditCardIcon,
  CalendarDays,
  BadgePercent,
  Truck as TruckIcon,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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
  increase_rate: string | null
  total_amount: string
  delivery_status: string
  delivery_name: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface DeliveryUser {
  id: number
  role: string
  name: string
  email: string
  phone: string
  active: boolean
  orders: Order[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  { value: 'delivering', label: 'Delivering', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
]

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'delivery' | 'orders'>('delivery')

  useEffect(() => {
    fetchDeliveryDetails()
  }, [params.id])

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiFetch(`/back/man-delivery/${params.id}`)
      
      if (data.result !== 'Success' || !data.data) {
        throw new Error('Delivery details not found')
      }
      
      setDeliveryUser(data.data)
      setOrders(data.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch delivery details:', error)
      setError('Failed to load delivery details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDeliveryStatus = async (orderId: number, status: string) => {
    try {
      setUpdatingStatus(orderId)
      
      const response = await apiFetch(`/back/delivery/order/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (response.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, delivery_status: status }
              : order
          )
        )
        setStatusDropdownOpen(null)
        
        // Refresh data
        fetchDeliveryDetails()
      } else {
        throw new Error(response.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Time'
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
    const IconComponent = statusConfig.icon
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        <IconComponent className="h-3 w-3" />
        {statusConfig.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    if (status === '1') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3" />
          Paid
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="relative">
                <Truck className="h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Loading Delivery Details</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Fetching delivery information...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !deliveryUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto" />
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Delivery Not Found</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error || 'The delivery information could not be loaded.'}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/DeliveryService"
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delivery Agent: {deliveryUser.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {deliveryUser.orders.length} orders assigned
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchDeliveryDetails}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {deliveryUser.orders.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {deliveryUser.orders.filter(o => o.delivery_status === 'pending' || o.delivery_status === 'in_progress').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivering</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {deliveryUser.orders.filter(o => o.delivery_status === 'delivering').length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {deliveryUser.orders.filter(o => o.delivery_status === 'delivered').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'delivery'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Delivery Agent Info
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PackageOpen className="h-4 w-4" />
                  Assigned Orders ({deliveryUser.orders.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'delivery' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Agent Information */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Agent Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                      <BadgePercent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                      <p className="text-gray-900 dark:text-white capitalize">{deliveryUser.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{deliveryUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{deliveryUser.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        deliveryUser.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {deliveryUser.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Account Timeline
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Created</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(deliveryUser.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Time: {formatTime(deliveryUser.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Last Updated</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(deliveryUser.updatedAt)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Time: {formatTime(deliveryUser.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Orders Overview
              </h2>
              
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Customer: {order.name}
                        </p>
                      </div>
                      {getStatusBadge(order.delivery_status)}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(order.updatedAt)}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {order.total_amount} {order.payment_type === 'cash' ? 'EGP' : 'USD'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No orders assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Assigned Orders ({orders.length})
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Order #</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Address</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Payment</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Delivery Status</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.order_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.email}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{order.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {order.address_line}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.city}, {order.state} {order.zip_code}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {order.total_amount} {order.payment_type === 'cash' ? 'EGP' : 'USD'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                {order.payment_method}
                              </div>
                              {getPaymentStatusBadge(order.payment_status)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="relative">
                              <button
                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === order.id ? null : order.id)}
                                disabled={updatingStatus === order.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                              >
                                {getStatusBadge(order.delivery_status)}
                                {updatingStatus === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              
                              {statusDropdownOpen === order.id && (
                                <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                  {STATUS_OPTIONS.map((option) => {
                                    const IconComponent = option.icon
                                    return (
                                      <button
                                        key={option.value}
                                        onClick={() => handleUpdateDeliveryStatus(order.id, option.value)}
                                        disabled={updatingStatus === order.id}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                                          order.delivery_status === option.value 
                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                            : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <IconComponent className="h-4 w-4" />
                                          <span className={option.color.replace('100', '800').replace('bg-', 'text-')}>
                                            {option.label}
                                          </span>
                                        </div>
                                        {order.delivery_status === option.value && (
                                          <Check className="h-4 w-4 text-green-600" />
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/ordersDetiels/${order.id}`}
                                target="_blank"
                                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="View Order Details"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                             
                           
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders assigned</h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        This delivery agent doesnt have any assigned orders yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {orders.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0).toFixed(2)}
                      {orders.length > 0 ? (orders[0].payment_type === 'cash' ? ' EGP' : ' USD') : ''}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                    <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                      {orders.filter(o => o.payment_status === '0').length}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg">
                    <CreditCardIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {orders.length > 0 
                        ? (orders.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) / orders.length).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}