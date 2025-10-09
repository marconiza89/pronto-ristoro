// app/components/Background.tsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

type BlobCfg = {
  className: string;
  style?: React.CSSProperties;
};

const blobsCfg: BlobCfg[] = [
  // in alto a sinistra (fuori bordo)
  { className: 'left-[-12%] top-[-12%]', style: { width: 420, height: 420 } },
  // alto-dx morbido
  { className: 'right-[-10%] top-[-8%]', style: { width: 360, height: 360 } },
  // centro-dx
  { className: 'right-[-6%] top-[40%]', style: { width: 380, height: 380 } },
  // basso-sx
  { className: 'left-[-8%] bottom-[-10%]', style: { width: 460, height: 460 } },
];

const Background: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      blobRefs.current.forEach((el, i) => {
        // piccola variazione personalizzata per ogni blob
        const distance = 24 + i * 10; // px
        const duration = 8 + i * 2; // s
        gsap.to(el, {
          x: gsap.utils.random(-distance, distance),
          y: gsap.utils.random(-distance, distance),
          scale: gsap.utils.random(0.97, 1.05),
          rotate: gsap.utils.random(-2, 2),
          ease: 'sine.inOut',
          duration,
          yoyo: true,
          repeat: -1,
        });
      });

      // leggerissimo “breathing” della luce centrale
      const glow = rootRef.current?.querySelector<HTMLElement>('[data-glow]');
      if (glow) {
        gsap.to(glow, {
          opacity: 0.85,
          filter: 'blur(60px)',
          duration: 10,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 -z-10 h-[100svh] w-full"
      aria-hidden
    >
      {/* Base: tenue gradiente chiaro + vignettatura fredda */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-br from-[#eef0ff] via-white to-[#eef2ff]
        "
      />
      {/* Vignetta radiale molto soft (toni blu/viola) */}
      <div
        className="
          absolute inset-0 mix-blend-normal opacity-90
          bg-[radial-gradient(70%_60%_at_50%_40%,#ffffff_0%,#ffffff_35%,rgba(238,242,255,0.9)_55%,rgba(229,231,255,0.6)_75%,rgba(199,210,254,0.25)_100%)]
        "
        data-glow
        style={{ filter: 'blur(50px)' }}
      />

      {/* Blobs sfumati (toni indaco/azzurro), volutamente fuori bordo */}
      {blobsCfg.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) blobRefs.current[i] = el;
          }}
          className={[
            'absolute rounded-full blur-3xl will-change-transform',
            'bg-mainblue/22', // indigo-500/22
            cfg.className,
          ].join(' ')}
          style={cfg.style}
        />
      ))}

      {/* Sottile ombra/linea orizzontale sotto la tazza (richiamo grafico, ma astratto) */}
      <div
        className="absolute left-1/2 top-[58%] h-[3px] w-[140px] -translate-x-1/2 rounded-full bg-[#1e3a8a]/10 blur-[2px]"
      />
    </div>
  );
};

export default Background;
