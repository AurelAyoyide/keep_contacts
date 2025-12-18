import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
    className?: string;
    size?: 'sm' | 'default' | 'lg' | 'xl';
}

export function Spinner({ className, size = 'default' }: SpinnerProps) {
    return (
        <Loader2
            className={cn(
                'animate-spin text-primary',
                {
                    'h-4 w-4': size === 'sm',
                    'h-6 w-6': size === 'default',
                    'h-8 w-8': size === 'lg',
                    'h-12 w-12': size === 'xl',
                },
                className
            )}
        />
    );
}
