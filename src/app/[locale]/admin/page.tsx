import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });

  return {
    title: t('title'),
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { data: orders },
    { data: todayOrders },
    { data: pendingOrders },
    { data: topItems },
  ] = await Promise.all([
    supabase.from('orders').select('*'),
    supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString()),
    supabase.from('orders').select('*').eq('status', 'pending'),
    supabase
      .from('order_items')
      .select('menu_item_id, quantity, menu_items(*)')
      .order('quantity', { ascending: false })
      .limit(5),
  ]);

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const todayOrderCount = todayOrders?.length || 0;
  const todayRevenue =
    todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const pendingOrderCount = pendingOrders?.length || 0;

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate orders by status
  const ordersByStatus = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ].map((status) => ({
    status: status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
    count: orders?.filter((o) => o.status === status).length || 0,
  }));

  return (
    <AdminDashboardClient
      stats={{
        totalOrders,
        totalRevenue,
        averageOrderValue,
        pendingOrders: pendingOrderCount,
        todayOrders: todayOrderCount,
        todayRevenue,
      }}
      recentOrders={recentOrders || []}
      ordersByStatus={ordersByStatus}
      topItems={topItems || []}
    />
  );
}
