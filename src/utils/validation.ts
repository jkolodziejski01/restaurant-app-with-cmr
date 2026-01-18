import { z } from 'zod';

// Luhn algorithm for card validation
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Get card brand from number
export function getCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^(?:2131|1800|35)/.test(digits)) return 'JCB';

  return 'Unknown';
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

// Format expiry date
export function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

// Validate expiry date
export function validateExpiryDate(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

// Zod schemas
export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number'),
  orderType: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().max(500).optional(),
  tip: z.number().min(0),
});

export const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .refine((val) => validateLuhn(val), 'Invalid card number'),
  cardholderName: z.string().min(2, 'Name is required'),
  expiryDate: z
    .string()
    .refine((val) => validateExpiryDate(val), 'Invalid expiry date'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
});

export const profileFormSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
});

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const menuItemFormSchema = z.object({
  name: z.string().min(2).max(100),
  name_de: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  description_de: z.string().min(10).max(500),
  price: z.number().positive(),
  category: z.enum([
    'appetizers',
    'main_courses',
    'desserts',
    'beverages',
    'salads',
    'soups',
    'sides',
    'specials',
  ]),
  image_url: z.string().url().optional().or(z.literal('')),
  is_available: z.boolean(),
  is_vegetarian: z.boolean(),
  is_vegan: z.boolean(),
  is_gluten_free: z.boolean(),
  spice_level: z.number().min(0).max(3),
  preparation_time: z.number().positive(),
  calories: z.number().positive().optional(),
  allergens: z.array(z.string()),
});
