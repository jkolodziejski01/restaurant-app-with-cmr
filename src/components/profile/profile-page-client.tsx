'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, LogOut, Trash2 } from 'lucide-react';
import { Button, Input, Textarea, Card, CardTitle, Modal } from '@/components/ui';
import { profileFormSchema } from '@/utils/validation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { z } from 'zod';

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfilePageClientProps {
  profile: any;
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const { logout } = useAuthStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone || null,
          address: data.address || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
  setIsLoggingOut(true);
  
  // Immediate visual feedback
  toast.loading('Logging out...', { id: 'logout' });
  
  try {
    const supabase = createClient();
    
    // 1. Try normal logout with timeout
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'global' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);
    } catch (signOutError) {
      console.warn('SignOut had issues (might be OK):', signOutError);
    }
    
    // 2. ALWAYS do client-side cleanup
    if (typeof window !== 'undefined') {
      // Nuclear option for localStorage
      const backup: Record<string, string> = {};
      
      // Backup non-auth items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        if (!key.includes('supabase') && !key.startsWith('sb-') && !key.includes('auth')) {
          backup[key] = localStorage.getItem(key)!;
        }
      }
      
      // Clear everything
      localStorage.clear();
      
      // Restore non-auth items
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
    
    // 3. Call your custom logout function
    logout();
    
    // 4. Update toast
    toast.success('Logged out successfully', { id: 'logout' });
    
    // 5. FORCE navigation (don't use router)
    setTimeout(() => {
      // Hard refresh to clear all React state
      window.location.href = '/';
    }, 100);
    
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logged out locally', { id: 'logout' });
    
    // Still force navigation
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
  } finally {
    setIsLoggingOut(false);
  }
};

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const supabase = createClient();

      // Delete user profile from the database
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      // Sign out
      await supabase.auth.signOut();
      logout();

      toast.success('Account deleted successfully');
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('title')}
        </h1>

        {/* Profile Form */}
        <Card className="mb-6">
          <CardTitle className="mb-6">{t('personalInfo')}</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              leftIcon={<User className="h-5 w-5" />}
              {...register('fullName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              {...register('email')}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+49 123 456 7890"
              error={errors.phone?.message}
              leftIcon={<Phone className="h-5 w-5" />}
              {...register('phone')}
            />

            <Textarea
              label="Address"
              placeholder="123 Main St, City, Postal Code"
              error={errors.address?.message}
              {...register('address')}
            />

            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={!isDirty}
            >
              {t('updateProfile')}
            </Button>
          </form>
        </Card>

        {/* Logout */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Sign Out
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              {t('logout') || 'Logout'}
            </Button>
          </div>
        </Card>

        {/* Delete Account */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400">
                {t('deleteAccount')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('deleteAccountWarning')}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={t('deleteAccount')}
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              {t('deleteAccountWarning')}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
              >
                {t('confirmDelete')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
