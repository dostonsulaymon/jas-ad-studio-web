'use client';

import Image from 'next/image';
import { useId, useRef } from 'react';
import { t } from '@/lib/i18n';

/**
 * The hero's main visual, and the direction's first structural idea.
 *
 * A tray of real product photos bleeding off both edges, with one empty slot cut into
 * the middle of the run. The slot is the file input: the seller's photo is the missing
 * piece of the tray, not a button underneath a headline.
 *
 * The slot is a real <label> wrapping a real <input type="file">, so it is keyboard
 * reachable and announced as a file input rather than being a div with a click handler.
 */

type Plate = { src: string; alt: string; size: number; tilt: number };

/**
 * `phones.jpg` is deliberately absent: it is a Google Pixel press photo with visible
 * G logos, which is fine inside the studio where it reads as a seller's own upload, but
 * not in JAS's own marketing surface. See docs/design/README.md.
 */
const LEFT: Plate[] = [
  { src: '/namunalar/notebook.jpg', alt: 'Koʻk daftar', size: 214, tilt: -2.4 },
  { src: '/namunalar/rotary.jpg', alt: 'Eski disklik telefon', size: 272, tilt: 1.3 },
  { src: '/namunalar/wipes.jpg', alt: 'Nam salfetka', size: 190, tilt: -1 },
];

const RIGHT: Plate[] = [
  { src: '/namunalar/car.jpg', alt: 'Yengil avtomobil', size: 256, tilt: 2 },
  { src: '/namunalar/key.jpg', alt: 'Bronza kalit', size: 206, tilt: -1.8 },
  { src: '/namunalar/laptop.jpg', alt: 'Noutbuk', size: 272, tilt: 0.8 },
  { src: '/namunalar/charger.jpg', alt: 'Quvvatlagich va kabel', size: 196, tilt: -2 },
];

function PlateImg({ plate }: { plate: Plate }) {
  return (
    <Image
      src={plate.src}
      alt={plate.alt}
      width={plate.size}
      height={plate.size}
      // Static assets under /public, so next/image optimises them. The seller's own
      // photos are different: those come from a cookie-authenticated, no-store endpoint
      // that the optimiser cannot fetch, and they use a plain <img>.
      priority
      style={{
        width: plate.size,
        height: plate.size,
        transform: `rotate(${plate.tilt}deg)`,
      }}
      className="shrink-0 rounded-lg border border-border bg-stone-1 object-cover shadow-[0_1px_2px_rgba(23,33,29,0.08),0_14px_32px_rgba(23,33,29,0.11)]"
    />
  );
}

export function HeroTray({ onFiles }: { onFiles?: (files: FileList) => void }) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      data-tray
      className="mt-10 overflow-x-auto overflow-y-hidden pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      // The tray scrolls inside its own container. The page itself never scrolls
      // sideways, at any width (source 01 §39).
    >
      <div className="flex w-max items-center gap-[22px] pl-5 sm:-ml-10 sm:pl-14">
        {LEFT.map((plate) => (
          <PlateImg key={plate.src} plate={plate} />
        ))}

        <label
          htmlFor={inputId}
          style={{ transform: 'rotate(1.4deg)' }}
          className="flex size-[250px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-primary bg-primary/5 text-center transition-colors duration-fast hover:bg-primary/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary max-sm:size-[190px]"
        >
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full bg-primary text-2xl leading-none font-semibold text-white max-sm:size-8 max-sm:text-xl"
          >
            +
          </span>
          <span className="px-4 text-[14.5px] leading-snug font-bold text-primary max-sm:text-[13px]">
            {t.hero.trayDropTitle}
            <br />
            {t.hero.trayDropTitle2}
          </span>
          <input
            ref={input}
            id={inputId}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) onFiles?.(event.target.files);
            }}
          />
        </label>

        {RIGHT.map((plate) => (
          <PlateImg key={plate.src} plate={plate} />
        ))}
      </div>
    </div>
  );
}
