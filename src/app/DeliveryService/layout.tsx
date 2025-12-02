// app/DeliveryService/layout.tsx
'use client'

import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css';
export default function DeliveryServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}