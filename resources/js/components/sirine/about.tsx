import { ArrowDown, HeartHandshake, MessageCircle, Sparkles } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const principles = [
    {
        icon: MessageCircle,
        title: 'Komunikasi mudah',
        text: 'Pelaporan melalui percakapan sederhana dengan bahasa sehari-hari.',
    },
    {
        icon: HeartHandshake,
        title: 'Berorientasi masyarakat',
        text: 'Mempermudah penyampaian informasi kejadian dari masyarakat.',
    },
];

const fields = [
    { label: 'Jenis', value: 'Kecelakaan' },
    { label: 'Lokasi', value: 'Depan pasar' },
    { label: 'Korban', value: '1 orang terluka' },
    { label: 'Status', value: 'Menunggu tinjauan' },
];

export function About() {
    return (
        <section
            id="tentang"
            aria-labelledby="tentang-title"
            className="scroll-mt-16 bg-white py-24 lg:py-32"
        >
            <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-12 lg:gap-10 lg:px-8">
                <Reveal className="lg:col-span-6 lg:pr-8">
                    <SectionHeading
                        id="tentang-title"
                        eyebrow="Tentang SIRINE"
                        title="Informasi kejadian dimulai dari satu laporan yang jelas."
                        description="SIRINE (Sistem Informasi Respons Insiden dan Notifikasi Emergency) menggunakan simbol sirene sebagai pengingat pentingnya respons saat keadaan darurat. Sistem ini membantu masyarakat menyampaikan informasi insiden agar lebih mudah ditinjau dan ditangani."
                    />

                    <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
                        {principles.map((p) => (
                            <div key={p.title} className="border-t border-sg-line pt-5">
                                <dt className="flex items-center gap-2.5 font-display text-lg font-semibold text-sg-900">
                                    <p.icon className="size-[18px] text-sg-500" />
                                    {p.title}
                                </dt>
                                <dd className="mt-2 text-sm leading-6 text-sg-text">
                                    {p.text}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>

                <Reveal className="lg:col-span-6" delay={120}>
                    <figure
                        aria-label="Ilustrasi: cerita bebas dirapikan menjadi laporan terstruktur"
                        className="rounded-[28px] border border-sg-line bg-sg-mint-50 p-6 sm:p-9"
                    >
                        <p className="font-data text-[10px] tracking-[0.2em] text-sg-600 uppercase">
                            Cerita dari warga
                        </p>
                        <blockquote className="mt-3 rounded-2xl rounded-tl-md bg-white p-5 font-display text-xl leading-snug font-medium text-sg-800 shadow-sm ring-1 ring-sg-line">
                            “Tadi ada tabrakan motor depan pasar, ada yang luka.”
                        </blockquote>

                        <div className="my-6 flex items-center gap-3" aria-hidden="true">
                            <span className="h-px flex-1 border-t border-dashed border-sg-500/40" />
                            <span className="font-data inline-flex items-center gap-2 rounded-full bg-sg-900 px-3.5 py-1.5 text-[10px] tracking-wider text-sg-mint uppercase">
                                <Sparkles className="size-3.5" />
                                SIRINE merapikan
                                <ArrowDown className="size-3.5" />
                            </span>
                            <span className="h-px flex-1 border-t border-dashed border-sg-500/40" />
                        </div>

                        <p className="font-data text-[10px] tracking-[0.2em] text-sg-600 uppercase">
                            Laporan terstruktur
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {fields.map((f) => (
                                <div
                                    key={f.label}
                                    className="rounded-2xl bg-white p-4 ring-1 ring-sg-line"
                                >
                                    <p className="font-data text-[10px] tracking-widest text-sg-text/70 uppercase">
                                        {f.label}
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold text-sg-900">
                                        {f.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <figcaption className="mt-5 text-xs text-sg-text/80">
                            Ilustrasi — bukan data laporan sebenarnya.
                        </figcaption>
                    </figure>
                </Reveal>
            </div>
        </section>
    );
}
