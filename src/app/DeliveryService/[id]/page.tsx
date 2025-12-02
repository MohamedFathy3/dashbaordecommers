// import { apiFetch } from '@/lib/api'
// import { Order } from '@/types/order'
// import { 
//   ArrowLeft, 
//   Package, 
//   CreditCard, 
//   MapPin, 
//   Phone, 
//   Mail, 
//   Calendar,
//   DollarSign,
//   User,
//   Truck,
//   CheckCircle,
//   XCircle,
//   Printer,
//   Download
// } from 'lucide-react'
// import Link from 'next/link'
// import { notFound } from 'next/navigation'

// interface OrderDetailsPageProps {
//   params: {
//     id: string
//   }
// }

// export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
//   let order: Order
  
//   try {
//     const data = await apiFetch(`/back/orders/${params.id}`)
//     if (data.result !== 'Success' || !data.data) {
//       notFound()
//     }
//     order = data.data
//   } catch (error) {
//     console.error('Failed to fetch order:', error)
//     notFound()
//   }

//   const statusColors = {
//     pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//     confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//     shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//     delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//     cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
//   }

//   const totalItems = order.cards.reduce((sum, item) => sum + item.qty, 0)

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//           <div className="flex items-center gap-4">
//             <Link
//               href="/orders"
//               className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Order #{order.order_number}
//               </h1>
//               <p className="text-gray-600 dark:text-gray-300 mt-1">
//                 Created on {new Date(order.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
//               <Printer className="h-4 w-4" />
//               Print
//             </button>
//             <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
//               <Download className="h-4 w-4" />
//               Export
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Order Details */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Order Summary Card */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">CUSTOMER INFORMATION</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3">
//                       <User className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
//                         <p className="font-medium text-gray-900 dark:text-white">{order.name}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Mail className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
//                         <p className="font-medium text-gray-900 dark:text-white">{order.email}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Phone className="h-4 w-4 text-gray-400" />
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
//                         <p className="font-medium text-gray-900 dark:text-white">{order.phone}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">SHIPPING INFORMATION</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-start gap-3">
//                       <MapPin className="h-4 w-4 text-gray-400 mt-1" />
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
//                         <p className="font-medium text-gray-900 dark:text-white">
//                           {order.address_line}, {order.city}, {order.state} {order.zip_code}
//                         </p>
//                       </div>
//                     </div>
//                     {order.apartment && (
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Apartment</p>
//                         <p className="font-medium text-gray-900 dark:text-white">{order.apartment}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Order Items */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items ({totalItems})</h2>
              
//               <div className="space-y-4">
//                 {order.cards.map((item, index) => (
//                   <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
//                     <div className="relative">
//                       <img
//                         src={item.card.image}
//                         alt={item.card.name}
//                         className="w-20 h-20 object-cover rounded-lg"
//                       />
//                       <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
//                         {item.qty}
//                       </span>
//                     </div>
                    
//                     <div className="flex-1">
//                       <h3 className="font-medium text-gray-900 dark:text-white">{item.card.name}</h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
//                         {item.card.short_description}
//                       </p>
                      
//                       <div className="flex items-center justify-between mt-3">
//                         <div className="flex items-center gap-4">
//                           <span className="text-lg font-semibold text-gray-900 dark:text-white">
//                             {item.card.price} {item.card.currency}
//                           </span>
//                           {item.card.old_price && (
//                             <span className="text-sm text-gray-500 line-through">
//                               {item.card.old_price} {item.card.currency}
//                             </span>
//                           )}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           SKU: {item.card.product_number}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Order Totals */}
//               <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
//                 <div className="max-w-md ml-auto space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
//                     <span className="font-medium text-gray-900 dark:text-white">
//                       ${(parseFloat(order.total_amount) * 0.8).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Shipping</span>
//                     <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
//                   </div>
//                   {order.promo_code && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Discount ({order.promo_code})</span>
//                       <span className="font-medium text-green-600 dark:text-green-400">
//                         -${(parseFloat(order.total_amount) * 0.2).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                   <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
//                     <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
//                     <span className="text-lg font-bold text-gray-900 dark:text-white">
//                       {order.total_amount} {order.cards[0]?.card.currency || ''}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Status & Actions */}
//           <div className="space-y-6">
//             {/* Status Card */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status</h2>
              
//               <div className="flex items-center justify-between mb-6">
//                 <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
//                   {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                 </span>
//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   Updated: {new Date(order.updatedAt).toLocaleDateString()}
//                 </span>
//               </div>

//               {/* Status Update Component */}
//               {/* <OrderStatusUpdate orderId={order.id} currentStatus={order.status} /> */}
//             </div>

//             {/* Payment Information */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h2>
              
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Method</span>
//                   <span className="font-medium text-gray-900 dark:text-white capitalize">
//                     {order.payment_method}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Type</span>
//                   <span className="font-medium text-gray-900 dark:text-white capitalize">
//                     {order.payment_type}
//                   </span>
//                 </div>

//                 {order.payment_type === 'installment' && (
//                   <>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Installment Months</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {order.installment_months} months
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Increase Rate</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {(parseFloat(order.increase_rate || '0') * 100).toFixed(1)}%
//                       </span>
//                     </div>
//                   </>
//                 )}

//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
//                   <span className={`font-medium ${order.payment_status === '1' ? 'text-green-600' : 'text-yellow-600'}`}>
//                     {order.payment_status === '1' ? 'Paid' : 'Pending'}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Order Timeline */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h2>
              
//               <div className="space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
//                     <Calendar className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">Order Created</p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {new Date(order.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
//                     <CheckCircle className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">Last Updated</p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {new Date(order.updatedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


export default function DeliveryServicePage() {
  return (
    <div>
      Delivery Service Page
    </div>
  )
}