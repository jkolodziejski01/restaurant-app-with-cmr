'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { ArrowRight } from 'lucide-react';
import { MenuItem } from '@/types';

interface PopularDishesProps {
  items: MenuItem[];
}

export function PopularDishes({ items }: PopularDishesProps) {
  const t = useTranslations('home.popular');

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('title')}
            </h2>
            <div className="w-20 h-1 bg-orange-500 rounded-full" />
          </div>
          <Link href="/menu">
            <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {t('viewAll')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
