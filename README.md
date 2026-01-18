# Restaurant Management System

A modern, full-featured restaurant management system with customer ordering capabilities. Built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Features

### Public Pages
- **Homepage** - Hero section, features, popular dishes
- **Menu** - Full menu with filtering, search, and dietary options
- **Cart** - Guest checkout support with real-time updates
- **Checkout** - Complete order flow with mock payment

### Customer Portal
- **Order History** - View all past orders
- **Order Tracking** - Real-time order status updates
- **Profile Management** - Update personal information

### Admin Dashboard
- **Dashboard** - Overview statistics and recent orders
- **Order Management** - Update order statuses, view details
- **Menu Management** - Full CRUD for menu items
- **Inventory Management** - Track stock levels

### Core Features
- **i18n** - German and English language support
- **Theme System** - Dark/Light mode with system preference detection
- **Authentication** - Supabase Auth with role-based access control
- **Real-time Updates** - Live order tracking via Supabase Realtime
- **Mock Payment** - Card validation with Luhn algorithm
- **Security** - Rate limiting, XSS protection, security headers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Restaurant
```

2. Install dependencies:
```bash
npm i
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Run the contents of `supabase/schema.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Localized routes
│   │   ├── admin/          # Admin dashboard
│   │   ├── checkout/       # Checkout page
│   │   ├── login/          # Login page
│   │   ├── menu/           # Menu page
│   │   ├── orders/         # Order pages
│   │   ├── profile/        # Profile page
│   │   ├── register/       # Register page
│   │   ├── layout.tsx      # Locale layout
│   │   └── page.tsx        # Homepage
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── admin/              # Admin components
│   ├── auth/               # Authentication components
│   ├── cart/               # Cart components
│   ├── checkout/           # Checkout components
│   ├── home/               # Homepage components
│   ├── layout/             # Layout components
│   ├── menu/               # Menu components
│   ├── orders/             # Order components
│   ├── profile/            # Profile components
│   ├── providers/          # Context providers
│   └── ui/                 # UI components
├── hooks/                  # Custom hooks
├── i18n/
│   ├── messages/           # Translation files
│   ├── config.ts           # i18n configuration
│   └── navigation.ts       # Navigation helpers
├── lib/
│   └── supabase/           # Supabase clients
├── store/                  # Zustand stores
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

## Database Schema

The database includes the following tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `menu_items` - Menu items with translations
- `orders` - Customer orders
- `order_items` - Items within orders
- `payments` - Payment records
- `inventory` - Stock tracking
- `carts` - Shopping carts
- `cart_items` - Items in carts


## Admin Access

Login: admin@admin.com 
Password: adminpwd

## Mock Payment

The payment system uses the Luhn algorithm for card validation. Test cards:
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Any valid-format card number will work

## Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: XSS protection, HSTS, CSP via middleware
- **Input Validation**: Zod schemas for all forms
- **SQL Injection Protection**: Supabase prepared statements
- **XSS Protection**: Input sanitization utilities
- **Row Level Security**: Database-level access control

## Performance Optimizations

- Image optimization via Next.js Image
- Code splitting with dynamic imports
- Optimized package imports (lucide-react)
- Database indexing on frequently queried columns
- Lazy loading for non-critical components

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Skip to main content link
- Focus indicators
- Screen reader friendly

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Application URL |

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
```bash
npm run build
npm run start
```
### Summary of Fixes

1. Registration Error Handling
Updated src/components/auth/register-form.tsx:

Added better error handling for Supabase 500 errors
Added emailRedirectTo option for email confirmation
Shows appropriate messages for different error types (email in use, server error, etc.)
Handles email confirmation flow properly
2. Order Confirmation Page for Guests
Created new files:

src/app/[locale]/order-confirmation/[id]/page.tsx - Server component that fetches order data
src/components/orders/order-confirmation-client.tsx - Client component with order summary, estimated time, payment info, and print functionality
3. Updated Checkout Redirect
Modified src/components/checkout/checkout-page-client.tsx to redirect to /order-confirmation/[id] instead of /orders/[id] after successful checkout.

4. Added Translations
Added orderConfirmation translations to both:

src/i18n/messages/en.json
src/i18n/messages/de.json

## TODO:

ADMIN PANEL WORKS BUT CANT ADD A MENU ITEM.

## License

MIT License


