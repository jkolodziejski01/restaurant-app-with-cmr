import { getTranslations } from 'next-intl/server';
import { CheckoutPageClient } from '@/components/checkout/checkout-page-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  return {
    title: t('title'),
  };
}

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
