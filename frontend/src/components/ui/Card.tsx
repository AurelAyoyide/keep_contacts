import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'clickable' | 'outline' | 'glass';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl border bg-card text-card-foreground shadow-sm transition-all',
                    {
                        'hover:shadow-md': variant === 'clickable',
                        'cursor-pointer hover:border-primary/50': variant === 'clickable',
                        'border-transparent shadow-none bg-muted/50': variant === 'outline',
                        'glass border-white/20 shadow-none': variant === 'glass',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

export { Card };
