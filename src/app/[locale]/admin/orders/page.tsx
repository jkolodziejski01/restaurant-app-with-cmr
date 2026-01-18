import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminOrdersClient } from '@/components/admin/admin-orders-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.orders' });

  return {
    title: t('title'),
  };
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      ),
      payments (*)
    `)
    .order('created_at', { ascending: false });

  return <AdminOrdersClient orders={orders || []} />;
}
