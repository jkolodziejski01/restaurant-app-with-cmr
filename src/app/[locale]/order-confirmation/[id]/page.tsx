import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { OrderConfirmationClient } from '@/components/orders/order-confirmation-client';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orderConfirmation' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

interface OrderConfirmationPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch order without auth requirement (for guest orders)
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch order items with menu item details
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      *,
      menu_items (
        id,
        name,
        name_de,
        image_url,
        price
      )
    `)
    .eq('order_id', id);

  // Fetch payment info
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', id)
    .single();

  return (
    <OrderConfirmationClient
      order={order}
      orderItems={orderItems || []}
      payment={payment}
    />
  );
}
