import { ArrowUp, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type ReportField = 'type' | 'location' | 'time' | 'detail' | 'status';

export type ChatMessage = {
    id: string;
    from: 'bot' | 'user';
    text: string;
    /** Informasi yang "diekstrak" asisten dari pesan ini (ilustrasi). */
    fill?: Partial<Record<ReportField, string>>;
};

/**
 * Memutar skrip percakapan satu per satu, lengkap dengan indikator mengetik.
 * `active` menunda pemutaran sampai komponen terlihat.
 */
export function useChatScript(script: ChatMessage[], active: boolean) {
    const [count, setCount] = useState(0);
    const [run, setRun] = useState(0);

    useEffect(() => {
        if (!active) return;

        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        if (reduce) {
            setCount(script.length);
            return;
        }

        setCount(0);
        let cancelled = false;
        const timers: number[] = [];
        let i = 0;

        const step = () => {
            if (cancelled || i >= script.length) return;
            const wait = i === 0 ? 700 : script[i].from === 'bot' ? 1300 : 1000;
            timers.push(
                window.setTimeout(() => {
                    if (cancelled) return;
                    i += 1;
                    setCount(i);
                    step();
                }, wait),
            );
        };
        step();

        return () => {
            cancelled = true;
            timers.forEach((t) => window.clearTimeout(t));
        };
    }, [active, script, run]);

    const done = count >= script.length;
    return {
        count,
        done,
        typingFrom: !active || done ? null : script[count].from,
        replay: () => setRun((r) => r + 1),
    };
}

function TypingDots({ from }: { from: 'bot' | 'user' }) {
    return (
        <div
            className={cn(
                'sg-pop flex items-end gap-2',
                from === 'user' && 'justify-end',
            )}
            aria-hidden="true"
        >
            {from === 'bot' && <BotAvatar />}
            <div
                className={cn(
                    'flex gap-1 rounded-2xl px-4 py-3.5',
                    from === 'bot'
                        ? 'rounded-bl-md border border-sg-line bg-white'
                        : 'rounded-br-md bg-sg-800',
                )}
            >
                {[0, 1, 2].map((d) => (
                    <span
                        key={d}
                        className={cn(
                            'sg-dot size-1.5 rounded-full',
                            from === 'bot' ? 'bg-sg-500' : 'bg-sg-mint',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

function BotAvatar() {
    return (
        <span className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sg-mint-100 text-sg-700">
            <Bot className="size-4" />
        </span>
    );
}

/** Jendela Web Chatbot — murni ilustrasi, tidak interaktif. */
export function ChatWindow({
    messages,
    typingFrom,
    bodyClassName,
    className,
}: {
    messages: ChatMessage[];
    typingFrom: 'bot' | 'user' | null;
    bodyClassName?: string;
    className?: string;
}) {
    return (
        <div
            role="group"
            aria-label="Contoh percakapan dengan asisten SIGAP"
            className={cn(
                'overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]',
                className,
            )}
        >
            <div className="flex items-center gap-3 border-b border-sg-line bg-white px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-sg-900 text-sg-mint">
                    <Bot className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-sg-900">
                        Asisten SIGAP
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-sg-text">
                        <span className="relative flex size-2">
                            <span className="sg-ping absolute inline-flex size-full rounded-full bg-sg-500/60" />
                            <span className="relative inline-flex size-2 rounded-full bg-sg-500" />
                        </span>
                        Siap membantu
                    </p>
                </div>
                <span className="font-data rounded-full bg-sg-mint-100 px-2.5 py-1 text-[10px] font-medium tracking-wider text-sg-700">
                    AI
                </span>
            </div>

            <div
                className={cn(
                    'flex flex-col justify-end gap-3 overflow-hidden bg-sg-mint-50 px-4 py-5 [mask-image:linear-gradient(to_bottom,transparent,black_16%)]',
                    bodyClassName,
                )}
            >
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            'sg-pop flex items-end gap-2',
                            m.from === 'user' && 'justify-end',
                        )}
                    >
                        {m.from === 'bot' && <BotAvatar />}
                        <p
                            className={cn(
                                'max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-[1.55]',
                                m.from === 'bot'
                                    ? 'rounded-bl-md border border-sg-line bg-white text-sg-800'
                                    : 'rounded-br-md bg-sg-800 text-white',
                            )}
                        >
                            {m.text}
                        </p>
                    </div>
                ))}
                {typingFrom && <TypingDots from={typingFrom} />}
            </div>

            <div
                aria-hidden="true"
                className="flex items-center gap-3 border-t border-sg-line bg-white px-4 py-3.5"
            >
                <span className="flex-1 rounded-full bg-sg-paper px-4 py-2.5 text-[13px] text-sg-text/70">
                    Tulis pesan kamu...
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-sg-900 text-sg-mint">
                    <ArrowUp className="size-4" />
                </span>
            </div>
        </div>
    );
}
