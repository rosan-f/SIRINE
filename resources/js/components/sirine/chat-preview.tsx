import { Check, Clock3, FileText, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatWindow, useChatScript } from './chat-parts';
import type { ChatMessage, ReportField } from './chat-parts';
import { LaporButton } from './lapor-button';
import { Reveal, useInView } from './reveal';
import { SectionHeading } from './section-heading';

const script: ChatMessage[] = [
    {
        id: 'p1',
        from: 'bot',
        text: 'Halo! Selamat datang di SIRINE. Ada kejadian apa yang ingin kamu laporkan?',
    },
    {
        id: 'p2',
        from: 'user',
        text: 'Terjadi kecelakaan di dekat pasar.',
        fill: { type: 'Kecelakaan lalu lintas' },
    },
    {
        id: 'p3',
        from: 'bot',
        text: 'Baik, saya akan membantu mencatat informasi tersebut. Di sekitar lokasi mana kejadian ini berlangsung?',
    },
    {
        id: 'p4',
        from: 'user',
        text: 'Di Jalan Merdeka, depan gerbang pasar.',
        fill: { location: 'Jl. Merdeka, depan gerbang pasar' },
    },
    {
        id: 'p5',
        from: 'bot',
        text: 'Terima kasih. Kapan kejadiannya, dan apakah ada korban?',
    },
    {
        id: 'p6',
        from: 'user',
        text: 'Barusan, sekitar 10 menit lalu. Dua motor bertabrakan, satu orang terluka.',
        fill: {
            time: '± 10 menit lalu',
            detail: 'Dua sepeda motor bertabrakan, 1 orang terluka',
        },
    },
    {
        id: 'p7',
        from: 'bot',
        text: 'Sudah saya catat. Jika ada korban yang butuh pertolongan segera, hubungi 112. Laporanmu akan ditinjau petugas.',
        fill: { status: 'Menunggu tinjauan petugas' },
    },
];

const fieldMeta: { key: ReportField; label: string }[] = [
    { key: 'type', label: 'Jenis kejadian' },
    { key: 'location', label: 'Lokasi' },
    { key: 'time', label: 'Waktu' },
    { key: 'detail', label: 'Keterangan' },
    { key: 'status', label: 'Status' },
];

const points = [
    'Asisten menanyakan satu hal pada satu waktu.',
    'Jawaban bebas, tidak perlu mengisi formulir panjang.',
    'Detail yang masuk langsung dirangkum menjadi laporan.',
];

export function ChatPreview() {
    const [ref, inView] = useInView<HTMLDivElement>(0.3);
    const chat = useChatScript(script, inView);
    const messages = script.slice(0, chat.count);

    const report: Partial<Record<ReportField, string>> = {};
    for (const m of messages) Object.assign(report, m.fill);

    const filled = Object.keys(report).length;

    return (
        <section
            id="percakapan"
            aria-labelledby="percakapan-title"
            className="sg-grain relative isolate scroll-mt-16 overflow-hidden bg-sg-900 py-24 lg:py-32"
        >
            <div className="sg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_65%)]" />
            <div className="pointer-events-none absolute -right-40 bottom-0 size-[520px] rounded-full bg-sg-600/25 blur-[130px]" />

            <div className="relative mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8">
                <Reveal className="lg:col-span-4">
                    <SectionHeading
                        id="percakapan-title"
                        onDark
                        eyebrow="Preview Web Chatbot"
                        title="Seperti mengobrol, hasilnya laporan yang rapi."
                    />
                    <ul className="mt-8 space-y-4">
                        {points.map((p) => (
                            <li key={p} className="flex gap-3 text-[15px] leading-6 text-sg-soft">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sg-mint/15 text-sg-mint">
                                    <Check className="size-3" strokeWidth={3} />
                                </span>
                                {p}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-10">
                        <LaporButton tone="mint" size="lg" />
                    </div>
                </Reveal>

                <div ref={ref} className="grid gap-4 md:grid-cols-5 lg:col-span-8">
                    <ChatWindow
                        messages={messages}
                        typingFrom={chat.typingFrom}
                        bodyClassName="h-[400px]"
                        className="md:col-span-3"
                    />

                    <aside
                        aria-label="Ringkasan laporan yang tersusun dari percakapan (ilustrasi)"
                        className="flex flex-col rounded-[28px] bg-sg-mint-100 p-5 text-sg-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] md:col-span-2"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-sg-900 text-sg-mint">
                                <FileText className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">Ringkasan laporan</p>
                                <p className="font-data text-[10px] tracking-widest text-sg-600 uppercase">
                                    {chat.done ? 'Siap ditinjau' : 'Draf · disusun AI'}
                                </p>
                            </div>
                        </div>

                        <dl className="mt-5 flex-1 space-y-2.5">
                            {fieldMeta.map((f) => {
                                const value = report[f.key];
                                return (
                                    <div key={f.key} className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-sg-line">
                                        <dt className="font-data text-[10px] tracking-[0.15em] text-sg-text/70 uppercase">
                                            {f.label}
                                        </dt>
                                        <dd className="mt-1 min-h-5 text-[13px] leading-5 font-medium">
                                            {value ? (
                                                <span key={value} className="sg-pop block">
                                                    {f.key === 'status' && (
                                                        <Clock3 className="mr-1.5 -mt-0.5 inline size-3.5 text-sg-600" />
                                                    )}
                                                    {value}
                                                </span>
                                            ) : (
                                                <span aria-hidden="true" className="mt-1.5 block h-2 w-20 rounded-full bg-sg-line" />
                                            )}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>

                        <div className="mt-5">
                            <div className="flex items-center justify-between text-[11px] text-sg-text">
                                <span className="font-data tracking-wider">{filled}/{fieldMeta.length} TERISI</span>
                                <button
                                    type="button"
                                    onClick={chat.replay}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-sg-700 transition hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-sg-600 focus-visible:outline-none',
                                        !chat.done && 'pointer-events-none opacity-0',
                                    )}
                                    tabIndex={chat.done ? 0 : -1}
                                >
                                    <RotateCcw className="size-3" />
                                    Putar ulang
                                </button>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                <div
                                    className="h-full rounded-full bg-sg-600 transition-[width] duration-700"
                                    style={{ width: `${(filled / fieldMeta.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <p className="relative mx-auto mt-8 max-w-7xl px-5 text-xs text-sg-soft/70 lg:px-8">
                Ilustrasi percakapan — bukan data laporan sebenarnya.
            </p>
        </section>
    );
}
