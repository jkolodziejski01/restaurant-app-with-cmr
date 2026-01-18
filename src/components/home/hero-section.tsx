'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Fresh & Delicious</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('title')}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/menu">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {t('cta')}
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" size="lg">
                  {t('ctaSecondary')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">500+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Happy Customers
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">50+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Menu Items
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">30min</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-orange-200 dark:bg-orange-900/30 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-orange-300 dark:bg-orange-800/30 rounded-full blur-3xl opacity-50" />

              {/* Main image placeholder */}
              <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 shadow-2xl">
                <div className="aspect-square rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UtensilsCrossed className="w-32 h-32 text-white/80" />
                </div>

                {/* Floating cards */}
                <div className="absolute -left-8 top-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 animate-bounce">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-lg">
                        ✓
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Fresh Daily
                    </span>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 text-lg">
                        ⭐
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      4.9 Rating
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
