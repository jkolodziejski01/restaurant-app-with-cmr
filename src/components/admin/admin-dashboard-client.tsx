'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardTitle, Badge, Button } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import { DashboardStats, OrdersByStatus, OrderStatus } from '@/types';

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
}

interface TopItem {
  menu_item_id: string;
  quantity: number;
  menu_items?: { name: string } | { name: string }[] | null;
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  ordersByStatus: OrdersByStatus[];
  topItems: TopItem[];
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

export function AdminDashboardClient({
  stats,
  recentOrders,
  ordersByStatus,
  topItems,
}: AdminDashboardClientProps) {
  const t = useTranslations('admin.dashboard');

  const statCards = [
    {
      title: t('totalOrders'),
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    },
    {
      title: t('totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    },
    {
      title: t('averageOrder'),
      value: formatCurrency(stats.averageOrderValue),
      icon: TrendingUp,
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    },
    {
      title: t('pendingOrders'),
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    },
  ];

  const getItemName = (menu_items: TopItem['menu_items']): string => {
  if (!menu_items) return 'Unknown';
  if (Array.isArray(menu_items)) {
    return menu_items[0]?.name || 'Unknown';
  }
  return menu_items.name || 'Unknown';
};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <h3 className="text-lg font-medium opacity-90">{t('todayOrders')}</h3>
          <p className="text-4xl font-bold mt-2">{stats.todayOrders}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-medium opacity-90">{t('todayRevenue')}</h3>
          <p className="text-4xl font-bold mt-2">
            {formatCurrency(stats.todayRevenue)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>{t('recentOrders')}</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.customer_name} • {formatRelativeTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusColors[order.status as OrderStatus]} size="sm">
                      {order.status}
                    </Badge>
                    <span className="font-medium text-orange-500">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardTitle className="mb-4">{t('ordersByStatus')}</CardTitle>
          <div className="space-y-3">
            {ordersByStatus.map(({ status, count }) => {
              const total = ordersByStatus.reduce((sum, o) => sum + o.count, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === 'delivered'
                          ? 'bg-green-500'
                          : status === 'cancelled'
                          ? 'bg-red-500'
                          : status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardTitle className="mb-4">{t('topItems')}</CardTitle>
        {topItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No orders yet
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topItems.map((item, index) => (
              <div
                key={item.menu_item_id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-500 flex items-center justify-center font-bold mx-auto mb-2">
                  #{index + 1}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {getItemName(item.menu_items)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.quantity} ordered
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
