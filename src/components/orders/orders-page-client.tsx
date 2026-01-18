'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Package, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { OrderStatus } from '@/types';

interface OrdersPageClientProps {
  orders: any[];
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

export function OrdersPageClient({ orders }: OrdersPageClientProps) {
  const t = useTranslations('orders');
  const locale = useLocale();

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('noOrders')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start ordering from our menu!
          </p>
          <Link href="/menu">
            <Button leftIcon={<ShoppingBag className="h-4 w-4" />}>
              {t('viewMenu')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('title')}
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('orderNumber')}{order.order_number}
                    </h3>
                    <Badge variant={statusColors[order.status as OrderStatus]}>
                      {t(`statuses.${order.status}`)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t('placedOn')} {formatDate(order.created_at, locale === 'de' ? 'de-DE' : 'en-US')}
                    </span>
                    <span>
                      {order.order_items?.length || 0} items
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {order.order_items
                      ?.slice(0, 3)
                      .map((item: any) =>
                        locale === 'de'
                          ? item.menu_items?.name_de
                          : item.menu_items?.name
                      )
                      .join(', ')}
                    {order.order_items?.length > 3 && '...'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('total')}
                    </span>
                    <p className="text-xl font-bold text-orange-500">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      {t('viewDetails')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
