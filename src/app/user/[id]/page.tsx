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
  UserCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import MainLayout from '@/components/MainLayout';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string | null;
  payment_method: string;
  payment_type: string;
  delivery_status: string;
  createdAt: string;
  city: string;
  state: string;
  zip_code: string;
  promo_code: string | null;
  address_line: string;
}

interface Favorite {
  id: number;
  card_id: number;
  created_at: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  age: number | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  avatar: string | null;
  id_image: string | null;
  bank_statement_image: string | null;
  invoice_image: string | null;
  orders: Order[];
  favorites: Favorite[];
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites'>('overview');

  useEffect(() => {
    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch(`/back/user/${params.id}`);
      
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
      case 'delivering':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cash':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'installment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

  const handleDeleteUser = async () => {
    if (!user || !confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await apiFetch(`/back/user/${user.id}`, {
        method: 'DELETE',
      });
      
      if (response.result === 'Success') {
        router.push('/user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
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
              {error ? 'Error Loading User' : 'User Not Found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The user you are looking for does not exist.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/user')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back to Users
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

  // Calculate statistics
  const totalOrders = user.orders?.length || 0;
  const totalFavorites = user.favorites?.length || 0;
  const totalSpent = user.orders?.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount || '0') || 0);
  }, 0) || 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/users')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Details</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: US{String(user.id).padStart(3, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                {user.avatar ? (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <UserCircle size={64} className="text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Client'}
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

                {user.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Phone size={20} className="text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Joined</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <ShoppingBag size={20} className="text-blue-500" />
                    <span>Total Orders</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{totalOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Heart size={20} className="text-red-500" />
                    <span>Favorites</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{totalFavorites}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CreditCard size={20} className="text-green-500" />
                    <span>Total Spent</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</span>
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
                  Orders ({totalOrders})
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex-1 min-w-[120px] py-4 text-center font-medium transition-colors ${
                    activeTab === 'favorites'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Favorites ({totalFavorites})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Personal Details</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Full Name</div>
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            </div>
                            {user.age && (
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Age</div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.age}</div>
                              </div>
                            )}
                            {user.gender && (
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Gender</div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.gender}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Location</h4>
                          <div className="space-y-3">
                            {user.country && (
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Country</div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.country}</div>
                              </div>
                            )}
                            {user.city && (
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">City</div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.city}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-gray-500 dark:text-gray-400">Documents</h4>
                      <div className="flex flex-wrap gap-3">
                        {user.id_image && (
                          <a
                            href={user.id_image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            📄 ID Document
                          </a>
                        )}
                        {user.bank_statement_image && (
                          <a
                            href={user.bank_statement_image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                          >
                            🏦 Bank Statement
                          </a>
                        )}
                        {user.invoice_image && (
                          <a
                            href={user.invoice_image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            🧾 Invoice
                          </a>
                        )}
                        {!user.id_image && !user.bank_statement_image && !user.invoice_image && (
                          <p className="text-gray-500 dark:text-gray-400">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order History</h3>
                    {user.orders?.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {user.orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-900 dark:text-white">{order.order_number}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(order.payment_type)}`}>
                                    {order.payment_type}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    {order.address_line}, {order.city}, {order.state} {order.zip_code}
                                  </div>
                                  {order.promo_code && (
                                    <div className="flex items-center gap-2">
                                      <span>Promo:</span>
                                      <span className="font-medium">{order.promo_code}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                  {/* {order.total_amount ? `$${parseFloat(order.total_amount).toFixed(2)}` : 'N/A'} */}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4 text-gray-400">📦</div>
                        <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Favorite Items</h3>
                    {user.favorites?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {user.favorites.map((fav) => (
                          <div
                            key={fav.id}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">Card #{fav.card_id}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Added: {new Date(fav.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                           
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4 text-gray-400">❤️</div>
                        <p className="text-gray-500 dark:text-gray-400">No favorite items</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
          
          </div>
        </div>
      </div>
    </MainLayout>
  );
}