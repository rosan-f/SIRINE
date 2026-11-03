import { cn } from '@/lib/utils';

type Tone = 'light' | 'dark';

/** Tanda SIRINE: sirene sebagai simbol peringatan dan respons darurat. */
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
                d="M8 25h16m-14-3h12l-1.5-4h-9L10 22Zm2-7a6 6 0 0 1 12 0v2H10v-2Z"
                className={onDark ? 'stroke-sg-mint' : 'stroke-sg-900'}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 3v3M6.8 7.2l2.1 2.1m14.3-2.1-2.1 2.1"
                className={onDark ? 'stroke-sg-mint' : 'stroke-sg-900'}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <circle
                cx="16"
                cy="15"
                r="2"
                className={onDark ? 'fill-sg-mint' : 'fill-sg-900'}
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
                    SIRINE
                </span>
                <span
                    className={cn(
                        'font-data mt-1 text-[8.5px] tracking-[0.18em] uppercase',
                        onDark ? 'text-sg-soft' : 'text-sg-text/80',
                    )}
                >
                    Sistem Informasi Respons Insiden
                </span>
            </span>
        </span>
    );
}
