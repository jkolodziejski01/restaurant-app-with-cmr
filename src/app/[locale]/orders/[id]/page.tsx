import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OrderDetailClient } from '@/components/orders/order-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'orders' });
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('order_number')
    .eq('id', id)
    .single();

  return {
    title: order ? `${t('orderNumber')}${order.order_number}` : 'Order',
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      ),
      payments (*)
    `)
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
