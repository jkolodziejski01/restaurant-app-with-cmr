'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Button, Badge } from '@/components/ui';
import { MenuItemCard } from './menu-item-card';
import { MenuItem, MenuCategory, MenuFilters } from '@/types';
import { cn, debounce } from '@/utils/helpers';

interface MenuPageClientProps {
  items: MenuItem[];
}

const categories: MenuCategory[] = [
  'appetizers',
  'main_courses',
  'salads',
  'soups',
  'sides',
  'desserts',
  'beverages',
  'specials',
];

export function MenuPageClient({ items }: MenuPageClientProps) {
  const t = useTranslations('menu');
  const locale = useLocale();

  const [filters, setFilters] = useState<MenuFilters>({
    category: 'all',
    search: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    maxPrice: null,
    spiceLevel: null,
  });

  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const name = locale === 'de' ? item.name_de : item.name;
        const description = locale === 'de' ? item.description_de : item.description;

        if (
          !name.toLowerCase().includes(searchLower) &&
          !description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Dietary filters
      if (filters.isVegetarian && !item.is_vegetarian) return false;
      if (filters.isVegan && !item.is_vegan) return false;
      if (filters.isGlutenFree && !item.is_gluten_free) return false;

      // Price filter
      if (filters.maxPrice && item.price > filters.maxPrice) return false;

      // Spice level filter
      if (filters.spiceLevel !== null && item.spice_level !== filters.spiceLevel) {
        return false;
      }

      return true;
    });
  }, [items, filters, locale]);

  const handleSearchChange = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 300);

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      maxPrice: null,
      spiceLevel: null,
    });
  };

  const activeFiltersCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.isVegetarian ? 1 : 0) +
    (filters.isVegan ? 1 : 0) +
    (filters.isGlutenFree ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.spiceLevel !== null ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<SlidersHorizontal className="h-5 w-5" />}
          >
            {t('filters.title')}
            {activeFiltersCount > 0 && (
              <Badge variant="warning" size="sm" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('filters.title')}
              </h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('filters.clearAll')}
              </Button>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('filters.categories')}
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: 'all' }))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    filters.category === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('categories.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category }))
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      filters.category === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {t(`categories.${category}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Filters */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('filters.dietary')}
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      isVegetarian: !prev.isVegetarian,
                    }))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    filters.isVegetarian
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('filters.vegetarian')}
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      isVegan: !prev.isVegan,
                    }))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    filters.isVegan
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('filters.vegan')}
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      isGlutenFree: !prev.isGlutenFree,
                    }))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    filters.isGlutenFree
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('filters.glutenFree')}
                </button>
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('filters.spiceLevel')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        spiceLevel: prev.spiceLevel === level ? null : level,
                      }))
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      filters.spiceLevel === level
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {level === 0 ? 'Mild' : '🌶️'.repeat(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}{' '}
          found
        </p>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('noResults')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>{t('filters.clearAll')}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
