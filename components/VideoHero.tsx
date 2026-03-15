"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import Image from "next/image";

interface VideoHeroProps {
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
}

export function VideoHero({
  videoSrc = "/videos/scalify-slide9.mp4",
  posterSrc = "/videos/slide9-poster.jpg",
  title = "Watch How We Scale Brands",
  subtitle = "See Scalify in action — from strategy to execution.",
}: VideoHeroProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const fullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  return (
    <section className="py-20 bg-[#fffaf5]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-tag mb-4 inline-flex">✦ Our Story</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {title.split(" ").map((word, i) =>
              word === "Scale" || word === "Brands" ? (
                <span key={i} className="gradient-text">
                  {word}{" "}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-[#6b7280] text-lg max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Video Player */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] group">
            {hasVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={posterSrc}
                  muted={muted}
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                  onError={() => setHasVideo(false)}
                  onEnded={() => setPlaying(false)}
                />

                {/* Overlay controls */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                  {/* Centre play button */}
                  {!playing && (
                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 bg-[#f05223] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(240,82,35,0.5)] hover:scale-110 transition-transform"
                    >
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </button>
                  )}
                </div>

                {/* Bottom control bar */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-[#f05223] transition-colors"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-[#f05223] transition-colors"
                  >
                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={fullscreen}
                    className="text-white hover:text-[#f05223] transition-colors"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* Fallback: SVG slide as static image */
              <div className="aspect-video relative flex items-center justify-center bg-[#0a0a0a]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/slide9.svg"
                    alt="Scalify Pitch Deck Slide 9"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="relative z-10 text-center p-8">
                  <div className="w-20 h-20 bg-[#f05223]/20 border-2 border-[#f05223] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-[#f05223] ml-1" />
                  </div>
                  <p className="text-white/80 text-sm">
                    📹 Add your video to{" "}
                    <code className="text-[#f05223] bg-white/10 px-1.5 py-0.5 rounded text-xs">
                      /public/videos/scalify-slide9.mp4
                    </code>
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Export from Canva: Share → Download → MP4 Video
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#f05223]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#f05223]/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Export instructions banner */}
        <div className="mt-8 max-w-5xl mx-auto bg-[#f05223]/5 border border-[#f05223]/20 rounded-xl p-4 flex items-start gap-3">
          <span className="text-[#f05223] text-lg flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-[#f05223] mb-1">
              How to get your Canva video on the site
            </p>
            <ol className="text-xs text-[#6b7280] space-y-0.5 list-decimal ml-4">
              <li>Open your Canva design → go to <strong>Slide 9</strong></li>
              <li>Click <strong>Share</strong> → <strong>Download</strong> → choose <strong>MP4 Video</strong></li>
              <li>Select only slide 9 (or all slides if it's animated)</li>
              <li>Rename the downloaded file to <code className="bg-[#f5ede3] px-1 rounded">scalify-slide9.mp4</code></li>
              <li>Place it in <code className="bg-[#f5ede3] px-1 rounded">public/videos/</code> folder of this project</li>
              <li>Refresh the page — your video will autoplay! 🎉</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
