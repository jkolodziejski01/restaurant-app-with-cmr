'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  Banknote,
  Truck,
  Store,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Button, Input, Textarea, Card, CardTitle } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { checkoutFormSchema, paymentFormSchema } from '@/utils/validation';
import {
  formatCurrency,
  calculateOrderTotals,
  formatCardNumber,
  formatExpiryDate,
  getCardBrand,
  generateOrderNumber,
  cn,
} from '@/utils/helpers';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { z } from 'zod';

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
type PaymentFormData = z.infer<typeof paymentFormSchema>;

const tipOptions = [0, 2, 5, 10];

export function CheckoutPageClient() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const { items, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuthStore();

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const subtotal = getSubtotal();
  const { tax, deliveryFee, total } = calculateOrderTotals(
    items.map((i) => ({ quantity: i.quantity, unit_price: i.menuItem.price })),
    tip,
    orderType
  );

  const checkoutForm = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: user?.full_name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      orderType: 'delivery',
      deliveryAddress: user?.address || '',
      specialInstructions: '',
      tip: 0,
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  const handleTipChange = (value: number) => {
    setTip(value);
    setCustomTip('');
    checkoutForm.setValue('tip', value);
  };

  const handleCustomTipChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomTip(value);
    setTip(numValue);
    checkoutForm.setValue('tip', numValue);
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    paymentForm.setValue('cardNumber', value.replace(/\s/g, ''));
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    paymentForm.setValue('expiryDate', formatted);
  };

  const onSubmit = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const checkoutValid = await checkoutForm.trigger();
    if (!checkoutValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'card') {
      const paymentValid = await paymentForm.trigger();
      if (!paymentValid) {
        toast.error('Please enter valid payment details');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const checkoutData = checkoutForm.getValues();
      const orderNumber = generateOrderNumber();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          order_number: orderNumber,
          status: 'pending',
          order_type: orderType,
          subtotal,
          tax,
          delivery_fee: deliveryFee,
          tip,
          total,
          customer_name: checkoutData.customerName,
          customer_email: checkoutData.customerEmail,
          customer_phone: checkoutData.customerPhone,
          delivery_address:
            orderType === 'delivery' ? checkoutData.deliveryAddress : null,
          special_instructions: checkoutData.specialInstructions || null,
          estimated_time: new Date(
            Date.now() + (orderType === 'delivery' ? 45 : 30) * 60000
          ).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        total_price: item.menuItem.price * item.quantity,
        special_instructions: item.specialInstructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const paymentData = paymentForm.getValues();
      const { error: paymentError } = await supabase.from('payments').insert({
        order_id: order.id,
        amount: total,
        currency: 'EUR',
        status: 'completed', // Mock payment always succeeds
        payment_method: paymentMethod,
        card_last_four:
          paymentMethod === 'card'
            ? paymentData.cardNumber.slice(-4)
            : null,
        card_brand:
          paymentMethod === 'card'
            ? getCardBrand(paymentData.cardNumber)
            : null,
        transaction_id: `TXN_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)
          .toUpperCase()}`,
      });

      if (paymentError) throw paymentError;

      // Clear cart and redirect to confirmation page
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/${locale}/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add some items to your cart to checkout
          </p>
          <Link href="/menu">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardTitle className="mb-4">{t('customerInfo')}</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('form.name')}
                  placeholder={t('form.namePlaceholder')}
                  error={checkoutForm.formState.errors.customerName?.message}
                  {...checkoutForm.register('customerName')}
                  required
                />
                <Input
                  label={t('form.email')}
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  error={checkoutForm.formState.errors.customerEmail?.message}
                  {...checkoutForm.register('customerEmail')}
                  required
                />
                <Input
                  label={t('form.phone')}
                  type="tel"
                  placeholder={t('form.phonePlaceholder')}
                  error={checkoutForm.formState.errors.customerPhone?.message}
                  {...checkoutForm.register('customerPhone')}
                  required
                />
              </div>
            </Card>

            {/* Order Type */}
            <Card>
              <CardTitle className="mb-4">{t('orderType')}</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    orderType === 'delivery'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Truck
                    className={cn(
                      'h-8 w-8',
                      orderType === 'delivery'
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      orderType === 'delivery'
                        ? 'text-orange-500'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {t('delivery')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    orderType === 'pickup'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Store
                    className={cn(
                      'h-8 w-8',
                      orderType === 'pickup'
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      orderType === 'pickup'
                        ? 'text-orange-500'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {t('pickup')}
                  </span>
                </button>
              </div>

              {orderType === 'delivery' && (
                <div className="mt-4">
                  <Textarea
                    label={t('deliveryAddress')}
                    placeholder={t('form.addressPlaceholder')}
                    error={
                      checkoutForm.formState.errors.deliveryAddress?.message
                    }
                    {...checkoutForm.register('deliveryAddress')}
                    required
                  />
                </div>
              )}

              <div className="mt-4">
                <Textarea
                  label={t('specialInstructions')}
                  placeholder={t('specialInstructionsPlaceholder')}
                  {...checkoutForm.register('specialInstructions')}
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardTitle className="mb-4">{t('paymentMethod')}</CardTitle>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <CreditCard
                    className={cn(
                      'h-8 w-8',
                      paymentMethod === 'card'
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      paymentMethod === 'card'
                        ? 'text-orange-500'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {t('card')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Banknote
                    className={cn(
                      'h-8 w-8',
                      paymentMethod === 'cash'
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      paymentMethod === 'cash'
                        ? 'text-orange-500'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {t('cash')}
                  </span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Input
                      label={t('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      error={paymentForm.formState.errors.cardNumber?.message}
                      maxLength={19}
                      required
                    />
                    {cardNumber && (
                      <p className="mt-1 text-sm text-gray-500">
                        {getCardBrand(cardNumber)}
                      </p>
                    )}
                  </div>
                  <Input
                    label={t('cardholderName')}
                    placeholder="John Doe"
                    error={paymentForm.formState.errors.cardholderName?.message}
                    {...paymentForm.register('cardholderName')}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('expiryDate')}
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      error={paymentForm.formState.errors.expiryDate?.message}
                      maxLength={5}
                      required
                    />
                    <Input
                      label={t('cvv')}
                      placeholder="123"
                      type="password"
                      error={paymentForm.formState.errors.cvv?.message}
                      {...paymentForm.register('cvv')}
                      maxLength={4}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This is a mock payment system. Use any valid-format card
                    number (e.g., 4242 4242 4242 4242).
                  </p>
                </div>
              )}
            </Card>

            {/* Tip */}
            <Card>
              <CardTitle className="mb-4">{t('tip')}</CardTitle>
              <div className="flex flex-wrap gap-3">
                {tipOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleTipChange(option)}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                      tip === option && !customTip
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    {option === 0 ? t('tipNone') : formatCurrency(option)}
                  </button>
                ))}
                <Input
                  placeholder={t('tipCustom')}
                  type="number"
                  min="0"
                  step="0.01"
                  value={customTip}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  className="w-24"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardTitle className="mb-4">{t('orderSummary')}</CardTitle>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        {item.menuItem.image_url ? (
                          <Image
                            src={item.menuItem.image_url}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {locale === 'de'
                            ? item.menuItem.name_de
                            : item.menuItem.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} x{' '}
                          {formatCurrency(item.menuItem.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.menuItem.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('subtotal')}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tax (19%)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Delivery Fee
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(deliveryFee)}
                      </span>
                    </div>
                  )}
                  {tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Tip
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(tip)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-orange-500">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={onSubmit}
                >
                  {isSubmitting ? t('processing') : t('placeOrder')}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
