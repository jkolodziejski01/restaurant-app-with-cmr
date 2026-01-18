'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/utils/helpers';
import Image from 'next/image';

export function CartDrawer() {
  const t = useTranslations('cart');
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white dark:bg-gray-900 shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('title')} ({itemCount} {itemCount === 1 ? t('item') : t('items')})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('empty')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('emptySubtitle')}
            </p>
            <Link href="/menu" onClick={closeCart}>
              <Button>{t('browseMenu')}</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {item.menuItem.image_url ? (
                      <Image
                        src={item.menuItem.image_url}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-sm text-orange-500 font-medium">
                      {formatCurrency(item.menuItem.price)}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {item.specialInstructions}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors ml-auto"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-gray-100">
                  {t('subtotal')}
                </span>
                <span className="text-orange-500">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('tax')} and delivery calculated at checkout
              </p>
              <div className="flex gap-3">
                <Link href="/menu" onClick={closeCart} className="flex-1">
                  <Button variant="outline" className="w-full">
                    {t('continueShopping')}
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeCart} className="flex-1">
                  <Button className="w-full">{t('checkout')}</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
