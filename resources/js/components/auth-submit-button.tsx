import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Button> & {
    children: ReactNode;
    processing?: boolean;
};

export default function AuthSubmitButton({
    children,
    className,
    processing = false,
    ...props
}: Props) {
    return (
        <Button
            {...props}
            className={cn(
                'mt-1 h-11 w-full rounded-lg bg-sg-900 text-sm font-semibold text-white shadow-sm hover:bg-sg-700',
                className,
            )}
        >
            {processing && <Spinner />}
            {children}
        </Button>
    );
}
