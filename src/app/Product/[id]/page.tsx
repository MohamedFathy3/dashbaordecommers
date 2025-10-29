'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Percent, Tag, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import MainLayout from '@/components/MainLayout';

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  old_price: string;
  discount: string;
  price: string;
  currency: string;
  quantity: number;
  image: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  result: string;
  data: Product;
  message: string;
  status: number;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const productId = params.id;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data: ApiResponse = await apiFetch(`/back/card/${productId}`);

        console.log("📦 Product data:", data);

        if (data.result === 'Success' && data.data) {
          setProduct(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );

  if (!product)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-600">Product not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );

  const discountAmount =
    parseFloat(product.old_price) - parseFloat(product.price);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {product.active ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Product Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Category: {product.category}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-blue-600">
                  {product.price} {product.currency}
                </h2>
                <div className="flex items-center space-x-3 mt-2">
                  <p className="text-gray-400 line-through">
                    {product.old_price} {product.currency}
                  </p>
                  {parseFloat(product.discount) > 0 && (
                    <span className="text-green-600 font-semibold">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {parseFloat(product.discount) > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-3">
                    <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                      You save {discountAmount.toFixed(2)} {product.currency}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Short Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {product.short_description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Quantity: {product.quantity}
                </span>
                {product.active ? (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="w-5 h-5 mr-2" /> Available
                  </Button>
                ) : (
                  <Button variant="destructive">
                    <XCircle className="w-5 h-5 mr-2" /> Unavailable
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
