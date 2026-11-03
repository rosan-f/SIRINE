import { cn } from '@/lib/utils';

type Tone = 'light' | 'dark';

/** Tanda SIGAP: balon percakapan dengan target/sinyal di tengahnya. */
export function LogoMark({
    tone = 'dark',
    className,
}: {
    tone?: Tone;
    className?: string;
}) {
    const onDark = tone === 'light'; // 'light' = dipakai di atas latar gelap
    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className={cn('size-9', className)}
        >
            <path
                d="M11 2h10a9 9 0 0 1 9 9v6a9 9 0 0 1-9 9h-7l-6 5v-6.4A9 9 0 0 1 2 17v-6a9 9 0 0 1 9-9z"
                className={onDark ? 'fill-sg-mint' : 'fill-sg-900'}
            />
            <circle
                cx="16"
                cy="14"
                r="5.2"
                fill="none"
                strokeWidth="2.2"
                className={onDark ? 'stroke-sg-900' : 'stroke-sg-mint'}
            />
            <circle
                cx="16"
                cy="14"
                r="1.9"
                className={onDark ? 'fill-sg-900' : 'fill-sg-mint'}
            />
        </svg>
    );
}

export function Logo({
    tone = 'dark',
    className,
}: {
    tone?: Tone;
    className?: string;
}) {
    const onDark = tone === 'light';
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <LogoMark tone={tone} />
            <span className="flex flex-col leading-none">
                <span
                    className={cn(
                        'font-display text-[22px] font-bold tracking-[-0.02em]',
                        onDark ? 'text-white' : 'text-sg-900',
                    )}
                >
                    SIGAP
                </span>
                <span
                    className={cn(
                        'font-data mt-1 text-[8.5px] tracking-[0.18em] uppercase',
                        onDark ? 'text-sg-soft' : 'text-sg-text/80',
                    )}
                >
                    Smart Incident Reporting
                </span>
            </span>
        </span>
    );
}
