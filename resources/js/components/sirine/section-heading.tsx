import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Eyebrow({
    children,
    onDark = false,
}: {
    children: ReactNode;
    onDark?: boolean;
}) {
    return (
        <p
            className={cn(
                'font-data flex items-center gap-3 text-[11px] font-medium tracking-[0.2em] uppercase',
                onDark ? 'text-sg-mint' : 'text-sg-600',
            )}
        >
            <span
                className={cn(
                    'h-px w-8',
                    onDark ? 'bg-sg-mint/60' : 'bg-sg-600/50',
                )}
            />
            {children}
        </p>
    );
}

export function SectionHeading({
    id,
    eyebrow,
    title,
    description,
    onDark = false,
    className,
}: {
    id: string;
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    onDark?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
            <h2
                id={id}
                className={cn(
                    'font-display mt-5 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.025em] text-balance',
                    onDark ? 'text-white' : 'text-sg-900',
                )}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={cn(
                        'mt-5 max-w-xl text-base leading-7',
                        onDark ? 'text-sg-soft' : 'text-sg-text',
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    );
}
