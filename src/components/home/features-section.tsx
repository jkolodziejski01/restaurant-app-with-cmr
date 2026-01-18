'use client';

import { useTranslations } from 'next-intl';
import { Leaf, Truck, Smartphone } from 'lucide-react';

export function FeaturesSection() {
  const t = useTranslations('home.features');

  const features = [
    {
      icon: Leaf,
      title: t('freshIngredients.title'),
      description: t('freshIngredients.description'),
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      icon: Truck,
      title: t('fastDelivery.title'),
      description: t('fastDelivery.description'),
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Smartphone,
      title: t('easyOrdering.title'),
      description: t('easyOrdering.description'),
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`inline-flex p-4 rounded-xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
