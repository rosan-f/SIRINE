import { ArrowDown, Check, Sparkles } from 'lucide-react';
import { LaporButton } from './lapor-button';
import { ChatWindow, useChatScript } from './chat-parts';
import type { ChatMessage } from './chat-parts';
import { cn } from '@/lib/utils';

const heroScript: ChatMessage[] = [
    {
        id: 'h1',
        from: 'bot',
        text: 'Halo! Selamat datang di SIRINE. Ada kejadian apa yang ingin kamu laporkan?',
    },
    { id: 'h2', from: 'user', text: 'Terjadi kecelakaan di dekat pasar.' },
    {
        id: 'h3',
        from: 'bot',
        text: 'Baik, saya akan membantu mencatat informasi tersebut. Di sekitar lokasi mana kejadian ini berlangsung?',
    },
];

function Rings() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -z-0 size-[640px] -translate-x-1/2 -translate-y-1/2 sm:size-[760px]"
        >
            {[100, 76, 52].map((pct, i) => (
                <span
                    key={pct}
                    style={{ width: `${pct}%`, height: `${pct}%` }}
                    className={cn(
                        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sg-mint/15',
                        i === 1 && 'sg-ring border-sg-mint/25',
                    )}
                />
            ))}
            <span className="sg-ring absolute top-1/2 left-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sg-mint/30 [animation-delay:2.4s]" />
        </div>
    );
}

export function Hero() {
    const chat = useChatScript(heroScript, true);
    const messages = heroScript.slice(0, chat.count);

    return (
        <section
            id="beranda"
            aria-labelledby="hero-title"
            className="sg-grain relative isolate overflow-hidden bg-sg-900"
        >
            <div className="sg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
            <div className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full bg-sg-600/30 blur-[120px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pt-32 pb-24 lg:min-h-[780px] lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-36 lg:pb-32">
                <div className="lg:col-span-7">
                    <p className="font-data max-w-[38rem] text-xs leading-6 tracking-[0.12em] text-sg-mint uppercase sm:text-sm">
                        Sistem Informasi Respons Insiden dan Notifikasi Emergency
                    </p>
                    <h1
                        id="hero-title"
                        className="font-display mt-7 max-w-[17ch] text-[clamp(2.5rem,6.4vw,4.5rem)] leading-[1] font-semibold tracking-[-0.035em] text-balance text-white"
                    >
                        Ceritakan kejadiannya.{' '}
                        <span className="relative inline-block whitespace-nowrap text-sg-mint">
                            SIRINE
                            <svg
                                viewBox="0 0 200 12"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-1.5 h-2.5 w-full"
                            >
                                <path
                                    d="M2 8c30-6 62-7 98-4s64 3 98-1"
                                    fill="none"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="stroke-sg-mint/70"
                                />
                            </svg>
                        </span>{' '}
                        yang menyusun laporannya.
                    </h1>

                    <p className="mt-6 font-display text-xl font-semibold text-sg-mint md:text-2xl">
                        Satu Peringatan, Awal Sebuah Penanganan.
                    </p>

                    <p className="mt-8 max-w-[34rem] text-base leading-8 text-sg-soft md:text-lg">
                        Sampaikan kejadian lewat percakapan sederhana. Asisten
                        AI membantu menanyakan detail yang diperlukan dan
                        merapikannya menjadi laporan yang siap ditinjau petugas.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <LaporButton tone="mint" size="lg" />
                        <a
                            href="#cara-kerja"
                            className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
                        >
                            Lihat cara kerja
                            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                        </a>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-[440px] lg:col-span-5 lg:max-w-[460px] lg:justify-self-end">
                    <Rings />
                    <ChatWindow
                        messages={messages}
                        typingFrom={chat.typingFrom}
                        bodyClassName="h-[360px]"
                        className="relative z-10"
                    />
                </div>
            </div>
        </section>
    );
}
