import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { PopularDishes } from '@/components/home/popular-dishes';
import { MenuItem } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('hero.title'),
    description: t('hero.subtitle'),
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: popularItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <PopularDishes items={(popularItems as MenuItem[]) || []} />
    </div>
  );
}
