import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { About } from '@/components/sirine/about';
import { ChatPreview } from '@/components/sirine/chat-preview';
import { Emergency } from '@/components/sirine/emergency';
import { Features } from '@/components/sirine/features';
import { Footer } from '@/components/sirine/footer';
import { Hero } from '@/components/sirine/hero';
import { HowItWorks } from '@/components/sirine/how-it-works';
import { Navbar } from '@/components/sirine/navbar';

export default function Welcome() {
    // Scroll halus untuk tautan anchor, hanya selama halaman ini aktif
    useEffect(() => {
        const root = document.documentElement;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;
        root.style.scrollBehavior = 'smooth';
        return () => {
            root.style.scrollBehavior = '';
        };
    }, []);

    return (
        <>
            <Head title="SIRINE | Pelaporan Insiden Darurat">
                <meta
                    name="description"
                    content="SIRINE (Sistem Informasi Respons Insiden dan Notifikasi Emergency) membantu masyarakat menyampaikan insiden darurat agar dapat ditangani dengan cepat dan terarah."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono:wght@400;500&display=swap"
                />
            </Head>

            <div className="min-h-screen bg-white text-sg-900 selection:bg-sg-mint selection:text-sg-900">
                <Navbar />
                <main>
                    <Hero />
                    <About />
                    <Features />
                    <HowItWorks />
                    <ChatPreview />
                    <Emergency />
                </main>
                <Footer />
            </div>
        </>
    );
}
