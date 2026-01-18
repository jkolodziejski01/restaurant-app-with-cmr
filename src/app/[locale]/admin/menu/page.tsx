import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AdminMenuClient } from '@/components/admin/admin-menu-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.menu' });

  return {
    title: t('title'),
  };
}

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  return <AdminMenuClient menuItems={menuItems || []} />;
}
