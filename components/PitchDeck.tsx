"use client";

import { useState, useRef, useEffect } from "react";

type Locale = "en" | "fr" | "ar";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "عر", flag: "🇦🇪" },
];

// Design IDs for the Canva Embed SDK
const CANVA_DESIGN: Record<Locale, { id: string; token: string }> = {
  en: { id: "DAG_PnZCor8", token: "3CiShfLm2jX6EGoba1VhZQ" },
  fr: { id: "DAHEMr9BS0k", token: "9w2dcHrk_zUTNcJY2axHTg" },
  ar: { id: "DAHELwhfjSQ", token: "ZhHuAg_OQK-jKB3spYoOfA" },
};

// Arabic starts at slide 23 (last slide), others at slide 1
const START_SLIDE: Record<Locale, number> = { en: 1, fr: 1, ar: 23 };

const CANVA_SRC: Record<Locale, string> = {
  en: `https://www.canva.com/design/${CANVA_DESIGN.en.id}/${CANVA_DESIGN.en.token}/view?embed`,
  fr: `https://www.canva.com/design/${CANVA_DESIGN.fr.id}/${CANVA_DESIGN.fr.token}/view?embed`,
  ar: `https://www.canva.com/design/${CANVA_DESIGN.ar.id}/${CANVA_DESIGN.ar.token}/view?embed`,
};

const PDF_PATH: Record<Locale, string> = {
  en: "/scalify-pitch-deck-en.pdf",
  fr: "/scalify-pitch-deck-fr.pdf",
  ar: "/scalify-pitch-deck-ar.pdf",
};

const PDF_FILENAME: Record<Locale, string> = {
  en: "Scalify Pitch Deck 2026.pdf",
  fr: "Scalify Pitch Deck 2026 - FR.pdf",
  ar: "Scalify Pitch Deck 2026 - AR.pdf",
};

const UI: Record<Locale, {
  badge: string;
  title: string;
  rotateTitle: string;
  rotateSubtitle: string;
  iframeTitle: string;
}> = {
  en: {
    badge: "Pitch Deck 2026",
    title: "The Scalify Story",
    rotateTitle: "Rotate your phone",
    rotateSubtitle: "This presentation is best viewed in landscape mode.",
    iframeTitle: "Scalify Pitch Deck 2026",
  },
  fr: {
    badge: "Présentation 2026",
    title: "L'Histoire de Scalify",
    rotateTitle: "Retournez votre téléphone",
    rotateSubtitle: "Cette présentation est mieux vue en mode paysage.",
    iframeTitle: "Présentation Scalify 2026",
  },
  ar: {
    badge: "عرض تقديمي 2026",
    title: "قصة سكاليفاي",
    rotateTitle: "أدِر هاتفك",
    rotateSubtitle: "يُفضَّل مشاهدة هذا العرض في الوضع الأفقي.",
    iframeTitle: "عرض سكاليفاي التقديمي 2026",
  },
};

export function PitchDeck() {
  const [locale, setLocale] = useState<Locale>("en");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const t = UI[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  // After the iframe loads, use postMessage to jump to the correct slide
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const targetSlide = START_SLIDE[locale];
    if (targetSlide <= 1) return; // slide 1 is default, no jump needed

    const handleLoad = () => {
      // Canva Embed SDK postMessage API — navigate to page index (0-based)
      const msg = JSON.stringify({
        type: "NAVIGATE_TO_PAGE",
        page: targetSlide - 1, // 0-based index
      });

      // Try immediately and retry a few times to make sure Canva is ready
      const send = () => iframe.contentWindow?.postMessage(msg, "https://www.canva.com");
      send();
      setTimeout(send, 800);
      setTimeout(send, 1800);
      setTimeout(send, 3000);
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [locale]);

  return (
    <div dir={dir}>
      {/* Force landscape on mobile via CSS */}
      <style>{`
        @media screen and (max-width: 768px) and (orientation: portrait) {
          #rotate-prompt { display: flex !important; }
          #main-content  { display: none  !important; }
        }
      `}</style>

      {/* Rotate prompt — portrait mobile only */}
      <div
        id="rotate-prompt"
        className="fixed inset-0 z-50 bg-[#0a0a0a] flex-col items-center justify-center gap-5 text-center px-8"
        style={{ display: "none" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 text-[#f05223]"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20 7H9a2 2 0 0 0-2 2v10"/>
          <path d="m15 2 5 5-5 5"/>
          <path d="M4 17h11a2 2 0 0 0 2-2V5"/>
          <path d="m9 22-5-5 5-5"/>
        </svg>
        <p className="text-white text-lg font-bold">{t.rotateTitle}</p>
        <p className="text-white/50 text-sm">{t.rotateSubtitle}</p>
      </div>

      {/* ── Main content ── */}
      <div
        id="main-content"
        className="bg-[#0a0a0a] flex flex-col"
        style={{ minHeight: "100dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 pt-5 pb-4 shrink-0">
          <div>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ background: "rgba(240,82,35,0.18)", color: "#f05223", border: "1px solid rgba(240,82,35,0.35)" }}
            >
              {t.badge}
            </span>
            <a
              href="https://scalify.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-[#f05223] transition-colors duration-200 cursor-pointer">
                {t.title}
              </h1>
            </a>
          </div>

          {/* Language switcher + Download */}
          <div className="flex items-center gap-2">
            {LOCALES.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 ${
                  locale === code
                    ? "bg-[#f05223] text-white shadow-[0_2px_8px_rgba(240,82,35,0.4)]"
                    : "text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-1" />

            {/* Download PDF */}
            <a
              href={PDF_PATH[locale]}
              download={PDF_FILENAME[locale]}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wide border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
              title="Download PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </a>
          </div>
        </div>

        {/* Canva iframe */}
        <div className="flex-1 px-3 sm:px-8 pb-5 sm:pb-8" style={{ minHeight: 0 }}>
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ paddingTop: "56.25%", background: "#111" }}
          >
            <iframe
              ref={iframeRef}
              key={locale}
              loading="lazy"
              src={CANVA_SRC[locale]}
              allowFullScreen
              allow="fullscreen; autoplay"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              title={t.iframeTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
