"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import Breadcrumb from "./Breadcrumb";
import { AuthProvider } from "../contexts/AuthContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const companyInfo = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "jobs",
    website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || "/",
    year: new Date().getFullYear()
  };

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(true)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          {/* Page content (scrollable area) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900">
              <Breadcrumb />
              {children}
            </main>

            {/* Footer */}
      <div className="h-2 w-full bg-gradient-to-bl from-[#3D63F4] to-[#000000]" />
            <footer className="bg-white   dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
              
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                {/* Company Name */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  © {companyInfo.year} {companyInfo.name}. All rights reserved.
                </div>
                
                {/* Copyright and Links */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Powered by {companyInfo.name}</span>
                  <span className="hidden md:inline">•</span>
                  <a 
                    href={`https://${companyInfo.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {companyInfo.website}
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}