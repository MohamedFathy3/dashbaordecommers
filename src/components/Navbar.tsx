'use client'

import {
  Search,
  User,
  ChevronsLeft,
  Bookmark,
  FileText,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import '@/styles/globals.css'
import { useAuth } from '../contexts/AuthContext'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'

export default function Navbar({
  sidebarOpen,
  toggleSidebar,
}: {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}) {
  const { user, logout } = useAuth()

  const favorites = [
    { name: 'Dashboard', url: '/' },
    { name: 'User', url: '/user' },
    { name: 'Order', url: '/order' },
  ]

  return (
  <> <header className="sticky top-0 z-50 border-b-black bg-white dark:bg-gray-800 border-b  border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronsLeft className={`h-5 w-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 focus:outline-none rounded-[15px] focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
  onClick={() => window.open(window.location.href, "_blank")} 
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Open Reports"
          >
            <FileText className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-green-600 hover:text-green-600 dark:hover:text-green-400"
                title="Favorites"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-1.5 text-sm font-semibold">Favorites</div>
              <DropdownMenuSeparator />
              {favorites.map((fav, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={() => window.location.href = fav.url}
                  className="cursor-pointer"
                >
                  {fav.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>


          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name ?? 'Guest'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{user?.name ?? 'Guest'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email ?? ''}</p>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => window.location.href = '/Profile'}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
      <div className="h-2 w-full bg-gradient-to-bl from-[#3D63F4] to-[#000000]" />
</>
   
  )
}
