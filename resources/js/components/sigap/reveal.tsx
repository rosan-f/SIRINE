import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** True sekali elemen masuk viewport. */
export function useInView<T extends Element>(threshold = 0.2) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -6% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return [ref, inView] as const;
}

export function Reveal({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const [ref, inView] = useInView<HTMLDivElement>(0.12);
    return (
        <div
            ref={ref}
            style={{ '--sg-delay': `${delay}ms` } as CSSProperties}
            className={cn('sg-reveal', inView && 'is-in', className)}
        >
            {children}
        </div>
    );
}
