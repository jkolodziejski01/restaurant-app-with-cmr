import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Restaurant - Delicious Food Delivered',
    template: '%s | Restaurant',
  },
  description:
    'Order delicious food online from Restaurant. Fresh ingredients, fast delivery, and easy online ordering.',
  keywords: [
    'restaurant',
    'food delivery',
    'online ordering',
    'pizza',
    'burger',
    'salad',
  ],
  authors: [{ name: 'Restaurant' }],
  creator: 'Restaurant',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://restaurant.example.com',
    siteName: 'Restaurant',
    title: 'Restaurant - Delicious Food Delivered',
    description:
      'Order delicious food online from Restaurant. Fresh ingredients, fast delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant - Delicious Food Delivered',
    description: 'Order delicious food online from Restaurant.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// Root layout just passes through to locale layout
// The html/body tags are in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}