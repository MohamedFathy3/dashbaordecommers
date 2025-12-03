// app/back/user/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Heart, 
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
  UserCircle,
  Truck,
  RefreshCw,
  DollarSign,
  Clock,
  Package,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import MainLayout from '@/components/MainLayout';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  payment_method: string;
  payment_type: string;
  delivery_status: string;
  delivery_name: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  zip_code: string;
  promo_code: string | null;
  apartment: string | null;
  payment_status: string;
  installment_months: number | null;
  increase_rate: string | null;
}

interface DeliveryUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  orders: Order[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivering', label: 'Delivering', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<DeliveryUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch(`/back/man-delivery/${params.id}`);
      
      if (data.result === 'Success') {
        setUser(data.data);
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId: number, status: string) => {
    try {
      setUpdatingStatus(orderId);
      
      const response = await apiFetch(`/back/delivery/order/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (response.success) {
        // Update local state
        if (user) {
          setUser({
            ...user,
            orders: user.orders.map(order => 
              order.id === orderId 
                ? { ...order, delivery_status: status }
                : order
            )
          })
        }
        setStatusDropdownOpen(null);
        
        // Refresh data
        fetchUserData();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    if (status === '1') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Paid
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    )
  }

  const getDeliveryStatusColor = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return statusConfig.color;
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cash':
        return 'bg-gray-100 text-gray-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'installment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    
    try {
      const response = await apiFetch(`/back/user/${user.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({
          active: !user.active
        })
      });
      
      if (response.result === 'Success') {
        setUser({ ...user, active: !user.active });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Calculate statistics
  const totalOrders = user?.orders?.length || 0;
  const totalSpent = user?.orders?.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount || '0') || 0);
  }, 0) || 0;

  const pendingOrders = user?.orders?.filter(o => 
    o.delivery_status === 'pending' || o.delivery_status === 'in_progress'
  ).length || 0;

  const deliveringOrders = user?.orders?.filter(o => 
    o.delivery_status === 'delivering'
  ).length || 0;

  const deliveredOrders = user?.orders?.filter(o => 
    o.delivery_status === 'delivered'
  ).length || 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading delivery agent data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {error ? 'Error Loading Delivery Agent' : 'Agent Not Found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The delivery agent you are looking for does not exist.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/DeliveryService')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back to Delivery
              </button>
              {error && (
                <button
                  onClick={fetchUserData}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/DeliveryService')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Delivery Agent Details</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agent ID: DA{String(user.id).padStart(3, '0')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUserData}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                  <Truck size={64} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Delivery Agent'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Mail size={20} className="text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                    <div className="font-medium truncate text-gray-900 dark:text-white">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Phone size={20} className="text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Joined</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Delivery Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Package size={20} className="text-blue-500" />
                    <span>Total Orders</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{totalOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock size={20} className="text-yellow-500" />
                    <span>Pending Orders</span>
                  </div>
                  <span className="font-bold text-xl text-yellow-600 dark:text-yellow-400">{pendingOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Truck size={20} className="text-purple-500" />
                    <span>Delivering</span>
                  </div>
                  <span className="font-bold text-xl text-purple-600 dark:text-purple-400">{deliveringOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Delivered</span>
                  </div>
                  <span className="font-bold text-xl text-green-600 dark:text-green-400">{deliveredOrders}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <DollarSign size={20} className="text-green-500" />
                    <span>Total Value</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    ${totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Activity */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow">
              <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Assigned Orders ({totalOrders})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agent Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Delivery Rate</h4>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {totalOrders > 0 
                              ? `${((deliveredOrders / totalOrders) * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {deliveredOrders} of {totalOrders} orders delivered
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Average Order Value</h4>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00'}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Per order average
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Recent Activity</h4>
                      {user.orders?.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Order #{order.order_number}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.name} • {formatDate(order.updatedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                              {order.delivery_status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {user.orders?.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assigned Orders</h3>
                    {user.orders?.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {user.orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col gap-4">
                              {/* Order Header */}
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <span className="font-bold text-gray-900 dark:text-white">{order.order_number}</span>
                                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(order.createdAt)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                                    {order.delivery_status}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(order.payment_type)}`}>
                                    {order.payment_type}
                                  </span>
                                  {getPaymentStatusBadge(order.payment_status)}
                                </div>
                              </div>

                              {/* Customer Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Customer</div>
                                  <div className="font-medium text-gray-900 dark:text-white">{order.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{order.email}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Contact</div>
                                  <div className="font-medium text-gray-900 dark:text-white">{order.phone}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Amount</div>
                                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                                    {order.total_amount} {order.payment_type === 'cash' ? 'EGP' : 'USD'}
                                  </div>
                                </div>
                              </div>

                              {/* Address */}
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Delivery Address</div>
                                <div className="text-gray-900 dark:text-white">
                                  {order.address_line}, {order.city}, {order.state} {order.zip_code}
                                </div>
                                {order.apartment && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Apartment: {order.apartment}</div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${order.phone}`}
                                    className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Call Customer"
                                  >
                                    <Phone size={16} />
                                  </a>
                                  <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(order.address_line + ', ' + order.city + ', ' + order.state)}`}
                                    target="_blank"
                                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Open in Google Maps"
                                  >
                                    <Navigation size={16} />
                                  </a>
                                  <button
                                    onClick={() => window.open(`/orders/${order.id}`, '_blank')}
                                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="View Order Details"
                                  >
                                    <ExternalLink size={16} />
                                  </button>
                                </div>

                                {/* Status Update */}
                                <div className="relative">
                                  <button
                                    onClick={() => setStatusDropdownOpen(statusDropdownOpen === order.id ? null : order.id)}
                                    disabled={updatingStatus === order.id}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
                                  >
                                    {getStatusBadge(order.delivery_status)}
                                    <span className="text-xs">
                                      {updatingStatus === order.id ? 'Updating...' : 'Change'}
                                    </span>
                                  </button>
                                  
                                  {statusDropdownOpen === order.id && (
                                    <div className="absolute top-full right-0 mt-1 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                      {STATUS_OPTIONS.map((option) => (
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
                                          <span className={option.color.replace('100', '800').replace('bg-', 'text-')}>
                                            {option.label}
                                          </span>
                                          {order.delivery_status === option.value && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4 text-gray-400">📦</div>
                        <p className="text-gray-500 dark:text-gray-400">No orders assigned to this delivery agent</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Orders</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 rounded-lg">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 dark:text-green-400">Total Value</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${totalSpent.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Delivery Rate</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalOrders > 0 
                        ? `${((deliveredOrders / totalOrders) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}