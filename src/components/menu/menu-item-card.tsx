'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ShoppingCart, Clock, Flame, Leaf, Wheat } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useCartStore } from '@/store/cart-store';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const t = useTranslations('menu.item');
  const locale = useLocale();
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();

  const name = locale === 'de' ? item.name_de : item.name;
  const description = locale === 'de' ? item.description_de : item.description;

  const handleAddToCart = () => {
    if (!item.is_available) return;

    setIsAdding(true);
    addItem(item);
    toast.success(`${name} added to cart!`);

    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-16 w-16" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {!item.is_available && (
            <Badge variant="error" size="sm">
              {t('outOfStock')}
            </Badge>
          )}
          {item.is_vegetarian && (
            <Badge variant="success" size="sm">
              <Leaf className="h-3 w-3 mr-1" />
              V
            </Badge>
          )}
          {item.is_vegan && (
            <Badge variant="success" size="sm">
              <Leaf className="h-3 w-3 mr-1" />
              VG
            </Badge>
          )}
          {item.is_gluten_free && (
            <Badge variant="info" size="sm">
              <Wheat className="h-3 w-3 mr-1" />
              GF
            </Badge>
          )}
        </div>

        {/* Spice indicator */}
        {item.spice_level > 0 && (
          <div className="absolute top-3 right-3 flex gap-0.5">
            {Array.from({ length: item.spice_level }).map((_, i) => (
              <Flame
                key={i}
                className="h-4 w-4 text-red-500 fill-red-500"
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {item.preparation_time} {t('prepTime')}
            </span>
          </div>
          {item.calories && (
            <span>{item.calories} {t('calories')}</span>
          )}
        </div>

        {/* Price and Add button */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-500">
            {formatCurrency(item.price)}
          </span>
          <Button
            size="sm"
            disabled={!item.is_available}
            isLoading={isAdding}
            onClick={handleAddToCart}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
          >
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
}
