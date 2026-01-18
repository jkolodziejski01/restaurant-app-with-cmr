'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  ChefHat,
} from 'lucide-react';
import { Input, Button } from '@/components/ui';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-orange-500 mb-4"
            >
              <ChefHat className="h-7 w-7" />
              <span>Restaurant</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {t('about')}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-orange-500" />
                <a href="tel:+491234567890" className="hover:text-orange-500 transition-colors">
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-orange-500" />
                <a href="mailto:info@restaurant.com" className="hover:text-orange-500 transition-colors">
                  {t('email')}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>{t('hoursValue')}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/menu"
                  className="text-sm hover:text-orange-500 transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm hover:text-orange-500 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-orange-500 transition-colors"
                >
                  {t('privacy')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-orange-500 transition-colors"
                >
                  {t('terms')}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('newsletter')}</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle newsletter subscription
              }}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <Button type="submit" size="md">
                {t('subscribe')}
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
