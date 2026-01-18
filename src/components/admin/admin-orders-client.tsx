'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { Input, Badge, Card, Select, Button, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { OrderStatus } from '@/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AdminOrdersClientProps {
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

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
  cancelled: null,
};

export function AdminOrdersClient({ orders: initialOrders }: AdminOrdersClientProps) {
  const t = useTranslations('admin.orders');
  const locale = useLocale();
  const supabase = createClient();

  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full order details
            const { data: newOrder } = await supabase
              .from('orders')
              .select(`
                *,
                order_items (
                  *,
                  menu_items (*)
                ),
                payments (*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newOrder) {
              setOrders((prev) => [newOrder, ...prev]);
              toast.success(`New order #${newOrder.order_number} received!`);
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (
          !order.order_number.toLowerCase().includes(search) &&
          !order.customer_name.toLowerCase().includes(search) &&
          !order.customer_email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }

      toast.success('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and track all orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusColors[order.status as OrderStatus]}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {order.order_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-orange-500">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at, locale === 'de' ? 'de-DE' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {nextStatusMap[order.status as OrderStatus] && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(
                              order.id,
                              nextStatusMap[order.status as OrderStatus]!
                            );
                          }}
                          isLoading={isUpdating}
                        >
                          Mark {nextStatusMap[order.status as OrderStatus]?.replace(/_/g, ' ')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <Badge variant={statusColors[selectedOrder.status as OrderStatus]} className="text-base px-4 py-2">
                {selectedOrder.status.replace(/_/g, ' ')}
              </Badge>
              {nextStatusMap[selectedOrder.status as OrderStatus] && (
                <Button
                  onClick={() =>
                    updateOrderStatus(
                      selectedOrder.id,
                      nextStatusMap[selectedOrder.status as OrderStatus]!
                    )
                  }
                  isLoading={isUpdating}
                >
                  Mark as {nextStatusMap[selectedOrder.status as OrderStatus]?.replace(/_/g, ' ')}
                </Button>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('customerInfo')}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>{selectedOrder.customer_name}</p>
                <p>{selectedOrder.customer_email}</p>
                <p>{selectedOrder.customer_phone}</p>
                {selectedOrder.delivery_address && (
                  <p>{selectedOrder.delivery_address}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Order Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {item.quantity}x {item.menu_items?.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              {selectedOrder.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Delivery</span>
                  <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                </div>
              )}
              {selectedOrder.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tip</span>
                  <span>{formatCurrency(selectedOrder.tip)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-orange-500">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            {selectedOrder.payments?.[0] && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('paymentInfo')}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    Method: {selectedOrder.payments[0].payment_method === 'card'
                      ? `${selectedOrder.payments[0].card_brand} ****${selectedOrder.payments[0].card_last_four}`
                      : 'Cash'}
                  </p>
                  <p>Status: {selectedOrder.payments[0].status}</p>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Special Instructions
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedOrder.special_instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
