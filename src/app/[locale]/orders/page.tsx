import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersPageClient } from '@/components/orders/orders-page-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orders' });

  return {
    title: t('title'),
  };
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <OrdersPageClient orders={orders || []} />;
}
