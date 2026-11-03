import { Bot, Check, ClipboardCheck, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LaporButton } from './lapor-button';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const steps = [
    {
        icon: MessageSquareText,
        title: 'Mulai pelaporan',
        text: 'Buka asisten SIRINE dan ceritakan kejadian yang ingin dilaporkan.',
    },
    {
        icon: Bot,
        title: 'Ceritakan kejadian',
        text: 'Sampaikan informasi kejadian melalui percakapan dengan asisten.',
    },
    {
        icon: ClipboardCheck,
        title: 'Lengkapi informasi',
        text: 'Asisten membantu mengumpulkan informasi tambahan yang diperlukan.',
    },
    {
        icon: Check,
        title: 'Laporan dicatat',
        text: 'Informasi laporan disimpan agar dapat dipantau dan ditinjau oleh admin.',
    },
];

export function HowItWorks() {
    return (
        <section
            id="cara-kerja"
            aria-labelledby="cara-kerja-title"
            className="scroll-mt-16 bg-white py-24 lg:py-32"
        >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionHeading
                        id="cara-kerja-title"
                        eyebrow="Cara kerja"
                        title="Empat langkah sederhana untuk menyampaikan laporan."
                        description="Alur pelaporan dirancang ringkas agar siapa pun bisa menyampaikan kejadian tanpa bingung harus mulai dari mana."
                        className="max-w-2xl"
                    />
                </Reveal>

                <ol className="mt-16 grid gap-0 lg:grid-cols-4 lg:gap-8">
                    {steps.map((s, i) => {
                        const last = i === steps.length - 1;
                        return (
                            <li
                                key={s.title}
                                className="relative pb-12 pl-16 last:pb-0 lg:pt-16 lg:pb-0 lg:pl-0"
                            >
                                {!last && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute top-12 bottom-1 left-[21px] w-px bg-sg-line lg:top-[21px] lg:right-[-2rem] lg:bottom-auto lg:left-14 lg:h-px lg:w-auto"
                                    />
                                )}
                                <Reveal delay={i * 110}>
                                    <span
                                        className={cn(
                                            'absolute top-0 left-0 flex size-11 items-center justify-center rounded-full border',
                                            last
                                                ? 'border-sg-mint bg-sg-mint text-sg-900'
                                                : 'border-sg-line bg-white text-sg-700',
                                        )}
                                    >
                                        <s.icon className="size-[18px]" />
                                    </span>
                                    <p className="font-data text-xs tracking-[0.2em] text-sg-500">
                                        LANGKAH {String(i + 1).padStart(2, '0')}
                                    </p>
                                    <h3 className="font-display mt-2 text-xl font-semibold tracking-tight text-sg-900">
                                        {s.title}
                                    </h3>
                                    <p className="mt-2 max-w-[17rem] text-sm leading-6 text-sg-text">
                                        {s.text}
                                    </p>
                                </Reveal>
                            </li>
                        );
                    })}
                </ol>

                <Reveal className="mt-20">
                    <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-sg-mint-50 p-7 ring-1 ring-sg-line sm:p-10 md:flex-row md:items-center">
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-sg-900 sm:text-[1.75rem]">
                                Mulai dari satu kalimat.
                            </p>
                            <p className="mt-2 text-sm text-sg-text">
                                Asisten SIRINE yang akan menanyakan sisanya.
                            </p>
                        </div>
                        <LaporButton size="lg" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
