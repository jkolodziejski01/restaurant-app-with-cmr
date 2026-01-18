'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Globe,
  ChefHat,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useCartStore } from '@/store/cart-store';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/utils/helpers';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useParams, useRouter } from 'next/navigation';

export function Header() {
  const t = useTranslations('nav');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params.locale as Locale) || 'en';

  const { getItemCount, openCart } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();

  const itemCount = getItemCount();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/menu', label: t('menu') },
  ];

  const switchLocale = (newLocale: Locale) => {
    router.push(`/${newLocale}${pathname}`);
    setIsLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-orange-500"
          >
            <ChefHat className="h-7 w-7" />
            <span className="hidden sm:inline">Restaurant</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-orange-500',
                  pathname === link.href
                    ? 'text-orange-500'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Change language"
              >
                <Globe className="h-5 w-5" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 py-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => switchLocale(locale)}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                        currentLocale === locale
                          ? 'text-orange-500 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {localeNames[locale]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-orange-500 rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User Menu / Auth */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm" leftIcon={<User className="h-4 w-4" />}>
                    {user?.full_name || t('profile')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">{t('register')}</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-orange-50 dark:bg-orange-950 text-orange-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('orders')}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                    >
                      {t('admin')}
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link href="/login" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
