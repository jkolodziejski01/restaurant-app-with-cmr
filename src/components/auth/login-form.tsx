'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ChefHat } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { loginFormSchema } from '@/utils/validation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error(tErrors('invalidCredentials'));
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before logging in.');
        } else if (error.message.includes('rate limit')) {
          toast.error('Too many login attempts. Please try again later.');
        } else {
          toast.error(error.message || tErrors('generic'));
        }
        return;
      }

      if (!authData.session) {
        toast.error('Login failed. Please try again.');
        return;
      }

      toast.success('Welcome back!');
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(tErrors('generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-orange-500 mb-4"
          >
            <ChefHat className="h-8 w-8" />
            <span>Restaurant</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('subtitle')}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-5 w-5" />}
              {...register('email')}
              required
            />

            <Input
              label={t('password')}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              leftIcon={<Lock className="h-5 w-5" />}
              {...register('password')}
              required
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('submit')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link
              href="/register"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {t('signUp')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
