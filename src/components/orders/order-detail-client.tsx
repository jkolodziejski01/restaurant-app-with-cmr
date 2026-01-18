'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Check,
  ChefHat,
  Truck,
  Home,
  ShoppingBag,
} from 'lucide-react';
import { Badge, Card, CardTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { OrderStatus } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/utils/helpers';

interface OrderDetailClientProps {
  order: any;
}

const statusColors: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  out_for_delivery: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const statusSteps: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  confirmed: <Check className="h-5 w-5" />,
  preparing: <ChefHat className="h-5 w-5" />,
  ready: <Package className="h-5 w-5" />,
  out_for_delivery: <Truck className="h-5 w-5" />,
  delivered: <Home className="h-5 w-5" />,
  cancelled: <Package className="h-5 w-5" />,
};

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const t = useTranslations('orders');
  const locale = useLocale();
  const [order, setOrder] = useState(initialOrder);

  // Real-time order updates
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const currentStepIndex = statusSteps.indexOf(order.status);
  const payment = order.payments?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('orderNumber')}{order.order_number}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('placedOn')} {formatDate(order.created_at, locale === 'de' ? 'de-DE' : 'en-US')}
            </p>
          </div>
          <Badge variant={statusColors[order.status as OrderStatus]} className="text-base px-4 py-2">
            {t(`statuses.${order.status}`)}
          </Badge>
        </div>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <Card className="mb-8">
            <CardTitle className="mb-6">{t('trackOrder')}</CardTitle>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              <div
                className="absolute left-6 top-6 w-0.5 bg-orange-500 transition-all duration-500 hidden sm:block"
                style={{
                  height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />

              <div className="space-y-4">
                {statusSteps.map((status, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={status}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-lg transition-colors',
                        isCurrent
                          ? 'bg-orange-50 dark:bg-orange-950'
                          : isActive
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : ''
                      )}
                    >
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-colors',
                          isActive
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        )}
                      >
                        {statusIcons[status]}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={cn(
                            'font-medium',
                            isActive
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {t(`statuses.${status}`)}
                        </h4>
                        <p
                          className={cn(
                            'text-sm',
                            isActive
                              ? 'text-gray-600 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-500'
                          )}
                        >
                          {t(`statusDescriptions.${status}`)}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-2 text-orange-500">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {order.estimated_time && order.status !== 'delivered' && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <Clock className="h-4 w-4 inline mr-2" />
                  {t('estimatedTime')}: {formatDate(order.estimated_time, locale === 'de' ? 'de-DE' : 'en-US')}
                </p>
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardTitle className="mb-4">{t('orderItems')}</CardTitle>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                      {item.menu_items?.image_url ? (
                        <Image
                          src={item.menu_items.image_url}
                          alt={item.menu_items.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {locale === 'de'
                          ? item.menu_items?.name_de
                          : item.menu_items?.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </p>
                      {item.special_instructions && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tax (19%)</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.delivery_fee)}
                    </span>
                  </div>
                )}
                {order.tip > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tip</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.tip)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">{t('total')}</span>
                  <span className="text-orange-500">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardTitle className="mb-4">Customer Information</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Package className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-gray-900 dark:text-white">{order.customer_phone}</span>
                </div>
                {order.delivery_address && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-gray-900 dark:text-white">{order.delivery_address}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Info */}
            {payment && (
              <Card>
                <CardTitle className="mb-4">Payment Information</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-900 dark:text-white">
                        {payment.payment_method === 'card'
                          ? `${payment.card_brand} ****${payment.card_last_four}`
                          : 'Cash on Delivery'}
                      </span>
                      <Badge
                        variant={payment.status === 'completed' ? 'success' : 'warning'}
                        size="sm"
                        className="ml-2"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  {payment.transaction_id && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-12">
                      Transaction ID: {payment.transaction_id}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <Card>
                <CardTitle className="mb-4">Special Instructions</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.special_instructions}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
