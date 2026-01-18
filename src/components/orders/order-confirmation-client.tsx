'use client';

import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Clock, MapPin, Phone, Mail, CreditCard, Banknote, Printer, Home } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { formatCurrency, formatDate } from '@/utils/helpers';
import Image from 'next/image';

interface OrderConfirmationClientProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    order_type: 'delivery' | 'pickup';
    subtotal: number;
    tax: number;
    delivery_fee: number;
    tip: number;
    total: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string | null;
    special_instructions: string | null;
    estimated_time: string | null;
    created_at: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions: string | null;
    menu_items: {
      id: string;
      name: string;
      name_de: string;
      image_url: string | null;
      price: number;
    } | null;
  }>;
  payment: {
    id: string;
    payment_method: 'card' | 'cash';
    card_last_four: string | null;
    card_brand: string | null;
    status: string;
  } | null;
}

export function OrderConfirmationClient({
  order,
  orderItems,
  payment,
}: OrderConfirmationClientProps) {
  const t = useTranslations('orderConfirmation');
  const locale = useLocale();

  const estimatedTime = order.estimated_time
    ? new Date(order.estimated_time)
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 print:bg-white print:py-4">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 print:hidden">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 print:text-2xl">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Order Number Card */}
        <Card className="mb-6 print:shadow-none print:border">
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('orderNumber')}
            </p>
            <p className="text-2xl font-bold text-orange-500 font-mono">
              {order.order_number}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {formatDate(order.created_at, locale === 'de' ? 'de-DE' : 'en-US')}
            </p>
          </div>
        </Card>

        {/* Estimated Time */}
        {estimatedTime && (
          <Card className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 print:bg-white">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {order.order_type === 'delivery'
                    ? t('estimatedDelivery')
                    : t('estimatedPickup')}
                </p>
                <p className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {estimatedTime.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-6 print:shadow-none print:border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('orderDetails')}
          </h2>

          {/* Customer Info */}
          <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{order.customer_email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{order.customer_phone}</span>
            </div>
            {order.order_type === 'delivery' && order.delivery_address && (
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{order.delivery_address}</span>
              </div>
            )}
          </div>

          {/* Order Type Badge */}
          <div className="py-4 border-b border-gray-200 dark:border-gray-700">
            <Badge variant={order.order_type === 'delivery' ? 'info' : 'default'}>
              {order.order_type === 'delivery' ? t('delivery') : t('pickup')}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="py-4 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t('items')}
            </h3>
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 print:hidden">
                  {item.menu_items?.image_url ? (
                    <Image
                      src={item.menu_items.image_url}
                      alt={item.menu_items.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xl">{item.quantity}x</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {locale === 'de'
                      ? item.menu_items?.name_de
                      : item.menu_items?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                  </p>
                  {item.special_instructions && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('specialInstructions')}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {order.special_instructions}
              </p>
            </div>
          )}

          {/* Order Totals */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('tax')}</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(order.tax)}
              </span>
            </div>
            {order.order_type === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('deliveryFee')}</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(order.delivery_fee)}
                </span>
              </div>
            )}
            {order.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('tip')}</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(order.tip)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white">{t('total')}</span>
              <span className="text-orange-500">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        {payment && (
          <Card className="mb-6 print:shadow-none print:border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('paymentInfo')}
            </h2>
            <div className="flex items-center gap-3">
              {payment.payment_method === 'card' ? (
                <>
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.card_brand} **** {payment.card_last_four}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('paymentCompleted')}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Banknote className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('cashOnDelivery')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('payOnArrival')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full" leftIcon={<Home className="h-4 w-4" />}>
              {t('backToHome')}
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="flex-1"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            {t('printReceipt')}
          </Button>
        </div>

        {/* Info Text */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:hidden">
          <p>{t('emailSent')}</p>
          <p className="mt-2">{t('questions')}</p>
        </div>
      </div>
    </div>
  );
}
