import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { MenuPageClient } from '@/components/menu/menu-page-client';
import { MenuItem } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'menu' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function MenuPage() {
  const supabase = await createClient();

  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching menu items:', error);
  }

  return <MenuPageClient items={(menuItems as MenuItem[]) || []} />;
}
