// // app/DeliveryService/page.tsx
// 'use client'

// import { useEffect, useState } from 'react'
// import { apiFetch } from '@/lib/api'
// import { OrdersResponse } from '@/types/order'
// import OrdersTable from '@/components/orders/OrdersTable'
// import { 
//   Package, 
//   Clock,
//   DollarSign,
//   CreditCard,
//   Truck,
//   ShoppingBag
// } from 'lucide-react'

// export default function DeliveryServicePage() {
//   const [stats, setStats] = useState({
//     totalOrders: 0,
//     pendingOrders: 0,
//     revenue: 0,
//     averageOrder: 0
//   })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null)

//   useEffect(() => {
//     fetchOrdersAndStats()
//   }, [])

//   const fetchOrdersAndStats = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       // Fetch orders for both table and stats
//       const payload = {
//         filters: {},
//         orderBy: "id",
//         orderByDirection: "desc",
//         perPage: 10,
//         page: 1,
//         paginate: true
//       }
      
//       const response = await apiFetch('/back/orders/index', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload)
//       })
      
//       if (response.data) {
//         setOrdersData(response)
        
//         const orders = response.data
//         const totalOrders = response.meta?.total || 0
        
//         const pendingOrders = orders.filter(order => order.status === 'pending').length
        
//         const revenue = orders.reduce((sum, order) => {
//           const amount = parseFloat(order.total_amount)
//           return sum + (isNaN(amount) ? 0 : amount)
//         }, 0)
        
//         const averageOrder = orders.length > 0 ? revenue / orders.length : 0
        
//         setStats({
//           totalOrders,
//           pendingOrders,
//           revenue,
//           averageOrder
//         })
//       }
//     } catch (err) {
//       console.error('Failed to fetch orders:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading && !ordersData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-center min-h-[70vh]">
//             <div className="text-center">
//               <div className="relative">
//                 <Truck className="h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
//                 <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
//               </div>
//               <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Loading Delivery Dashboard</h3>
//               <p className="mt-2 text-gray-600 dark:text-gray-400">Fetching your delivery data...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
//                   <Truck className="h-7 w-7 text-white" />
//                 </div>
//                 <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
//                   Orders Management
//                 </h1>
//               </div>
//               <p className="text-gray-600 dark:text-gray-300 text-lg">
//                 Manage and track all customer orders in real-time
//               </p>
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
//                   <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
//                     {stats.totalOrders.toLocaleString()}
//                   </p>
//                   {error && (
//                     <p className="text-sm text-red-500 dark:text-red-400 mt-1">
//                       Could not load stats
//                     </p>
//                   )}
//                 </div>
//                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
//                   <ShoppingBag className="h-8 w-8" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
//                   <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
//                     {stats.pendingOrders.toLocaleString()}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     Needs attention
//                   </p>
//                 </div>
//                 <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl">
//                   <Clock className="h-8 w-8" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
//                   <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
//                     ${stats.revenue.toFixed(2)}
//                   </p>
//                   <p className="text-sm text-green-600 dark:text-green-400 mt-1">
//                     Total revenue
//                   </p>
//                 </div>
//                 <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
//                   <DollarSign className="h-8 w-8" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Order</p>
//                   <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
//                     ${stats.averageOrder.toFixed(2)}
//                   </p>
//                   <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
//                     Average value
//                   </p>
//                 </div>
//                 <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
//                   <CreditCard className="h-8 w-8" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
//             <div className="flex items-center gap-3">
//               <div className="text-red-600 dark:text-red-400">⚠️</div>
//               <div>
//                 <p className="text-red-700 dark:text-red-300 font-medium">Error Loading Data</p>
//                 <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Orders Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="p-6">
//             <OrdersTable initialData={ordersData || undefined} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


export default function DeliveryService() {
  return (
    <div>
      Delivery Service Page
    </div>
  )
}