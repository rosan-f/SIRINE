import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** CTA pelaporan SIRINE yang mengarahkan warga ke bot Telegram. */
export function LaporButton({
    tone = 'dark',
    size = 'md',
    label = 'Mulai Lapor',
    className,
}: {
    /** 'mint' untuk latar gelap, 'dark' untuk latar terang */
    tone?: 'mint' | 'dark';
    size?: 'md' | 'lg';
    label?: string;
    className?: string;
}) {
    return (
        <a
            href="https://t.me/RosanSigapBot"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'group inline-flex items-center gap-3 rounded-full font-semibold whitespace-nowrap transition duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                size === 'lg' ? 'py-2 pr-2 pl-7 text-[15px]' : 'py-1.5 pr-1.5 pl-5 text-sm',
                tone === 'mint'
                    ? 'bg-sg-mint text-sg-900 hover:bg-sg-mint-300 focus-visible:ring-sg-mint focus-visible:ring-offset-sg-900'
                    : 'bg-sg-900 text-white hover:bg-sg-700 focus-visible:ring-sg-600 focus-visible:ring-offset-white',
                className,
            )}
        >
            {label}
            <span
                className={cn(
                    'flex items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45',
                    size === 'lg' ? 'size-11' : 'size-8',
                    tone === 'mint' ? 'bg-sg-900 text-sg-mint' : 'bg-sg-mint text-sg-900',
                )}
            >
                <ArrowUpRight className={size === 'lg' ? 'size-5' : 'size-4'} />
            </span>
        </a>
    );
}
