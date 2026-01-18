import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminInventoryClient } from '@/components/admin/admin-inventory-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.inventory' });

  return {
    title: t('title'),
  };
}

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      *,
      menu_items (*)
    `)
    .order('quantity');

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .order('name');

  return (
    <AdminInventoryClient
      inventory={inventory || []}
      menuItems={menuItems || []}
    />
  );
}
