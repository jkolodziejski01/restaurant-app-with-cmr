'use client';

import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-orange-500', sizes[size], className)}
    />
  );
}

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Spinner size="lg" />
      {message && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
}
