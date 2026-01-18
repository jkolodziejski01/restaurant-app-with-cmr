'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  
  
  ChefHat,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, labelKey: 'orders' },
  { href: '/admin/menu', icon: UtensilsCrossed, labelKey: 'menu' },
  { href: '/admin/inventory', icon: Package, labelKey: 'inventory' },
];

export function AdminSidebar() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
  setIsLoggingOut(true);
  
  // Immediate visual feedback
  toast.loading('Logging out...', { id: 'logout' });
  
  try {
    const supabase = createClient();
    
    // 1. Try normal logout with timeout
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'global' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);
    } catch (signOutError) {
      console.warn('SignOut had issues (might be OK):', signOutError);
    }
    
    // 2. ALWAYS do client-side cleanup
    if (typeof window !== 'undefined') {
      // Nuclear option for localStorage
      const backup: Record<string, string> = {};
      
      // Backup non-auth items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        if (!key.includes('supabase') && !key.startsWith('sb-') && !key.includes('auth')) {
          backup[key] = localStorage.getItem(key)!;
        }
      }
      
      // Clear everything
      localStorage.clear();
      
      // Restore non-auth items
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
    
    // 3. Call your custom logout function
    logout();
    
    // 4. Update toast
    toast.success('Logged out successfully', { id: 'logout' });
    
    // 5. FORCE navigation (don't use router)
    setTimeout(() => {
      // Hard refresh to clear all React state
      window.location.href = '/';
    }, 100);
    
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logged out locally', { id: 'logout' });
    
    // Still force navigation
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
  } finally {
    setIsLoggingOut(false);
  }
};

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-orange-500"
        >
          <ChefHat className="h-7 w-7" />
          <span>Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start"
          leftIcon={<LogOut className="h-5 w-5" />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
