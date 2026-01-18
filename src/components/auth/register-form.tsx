'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ChefHat } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { registerFormSchema } from '@/utils/validation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { z } from 'zod';

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.errors');
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Simple signup without complex options first
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            role: 'customer',
          },
          emailRedirectTo: `${window.location.origin}/${locale}/login`,
        }, 
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // Handle specific errors
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast.error(tErrors('emailInUse'));
        } else if (error.message.includes('Password')) {
          toast.error('Password requirements not met');
        } else if (error.status === 400) {
          toast.error('Invalid email or password format');
        } else if (error.status === 422) {
          toast.error('Email already exists');
        } else if (error.status === 500) {
          // Try without emailRedirectTo
          toast.error('Server error, trying alternative...');
          await tryAlternativeSignup(data);
          return;
        } else {
          toast.error(error.message || tErrors('generic'));
        }
        return;
      }

      // Check if email confirmation is required
      if (authData?.user?.identities?.length === 0) {
        toast.error(tErrors('emailInUse'));
        return;
      }

      // Success handling
      if (authData?.user && !authData.session) {
        toast.success('Please check your email to confirm your account!');
        
        // Manually create profile if trigger didn't work
        try {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: data.email,
            full_name: data.name,
            role: 'customer'
          });
        } catch (profileError) {
          console.warn('Profile creation failed, but user was created:', profileError);
        }
      } else {
        toast.success('Account created successfully!');
      }

      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(tErrors('generic'));
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative signup method without emailRedirectTo
  const tryAlternativeSignup = async (data: RegisterFormData) => {
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            role: 'customer',
          },
          // No emailRedirectTo
        }, 
      });

      if (error) throw error;
      
      toast.success('Account created! Please check your email.');
      router.push(`/${locale}/login`);
    } catch (error: any) {
      console.error('Alternative signup failed:', error);
      toast.error('Registration failed. Please try again later.');
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
              label={t('name')}
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              leftIcon={<User className="h-5 w-5" />}
              {...register('name')}
              required
            />

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
              helperText="At least 8 characters"
            />

            <Input
              label={t('confirmPassword')}
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="h-5 w-5" />}
              {...register('confirmPassword')}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('submit')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('hasAccount')}{' '}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {t('signIn')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}