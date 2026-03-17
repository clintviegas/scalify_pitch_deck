"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "عر", flag: "🇦🇪" },
] as const;

export function PitchDeck() {
  const t = useTranslations("pitchdeck");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    // Replace the current locale prefix in the path
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    startTransition(() => {
      router.push(newPath || `/${next}`);
    });
  };

  return (
    <>
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
        <p className="text-white text-lg font-bold">{t("rotateTitle")}</p>
        <p className="text-white/50 text-sm">{t("rotateSubtitle")}</p>
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
              {t("badge")}
            </span>
            <a
              href="https://scalify.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-[#f05223] transition-colors duration-200 cursor-pointer">
                {t("title")}
              </h1>
            </a>
          </div>

          {/* Language switcher */}
          <div className="flex items-center gap-1.5">
            {LOCALES.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                disabled={isPending}
                title={flag}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide transition-all duration-150
                  ${locale === code
                    ? "bg-[#f05223] text-white shadow-[0_2px_8px_rgba(240,82,35,0.4)]"
                    : "text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canva iframe — full height, Canva's native toolbar visible */}
        <div className="flex-1 px-3 sm:px-8 pb-5 sm:pb-8" style={{ minHeight: 0 }}>
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ paddingTop: "56.25%", background: "#111" }}
          >
            <iframe
              loading="lazy"
              src={t("iframeSrc")}
              allowFullScreen
              allow="fullscreen; autoplay"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              title={t("iframeTitle")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
