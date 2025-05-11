// Anda bisa menamai file ini, misalnya: src/components/ui/TestimonialScroller.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
// Pastikan path ini benar sesuai struktur proyek Anda
import { cn } from "../lib/utils"; // Atau '../lib/utils' jika itu yang benar

// Komponen Utama InfiniteMovingCards
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast", // Memastikan speed diterima sebagai prop
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  // Fungsi setup duplikasi elemen dan start awal
  // Didefinisikan di luar useEffect agar bisa dipanggil oleh effect pertama
  // Jika tidak dipakai di tempat lain, bisa juga dimasukkan ke effect pertama
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      if (items && scrollerRef.current.children.length === items.length) {
        const scrollerContent = Array.from(scrollerRef.current.children);
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          if (duplicatedItem instanceof HTMLElement) {
            duplicatedItem.setAttribute("aria-hidden", "true");
          }
          if (scrollerRef.current) {
            scrollerRef.current.appendChild(duplicatedItem);
          }
        });
      }
      // Hanya set start jika belum dimulai
      if (!start) {
        setStart(true);
      }
    }
  }

  // useEffect HANYA untuk setup duplikasi DOM sekali saat mount atau items berubah
  useEffect(() => {
    addAnimation();
    // Abaikan peringatan ESLint di sini jika diperlukan, karena addAnimation
    // mungkin dideklarasikan di scope komponen tapi setup DOM hanya perlu sekali/saat item berubah.
    // Jika addAnimation didefinisikan ulang di setiap render dan tidak di-memoize (useCallback),
    // maka cara terbaik adalah memindahkannya ke dalam effect ini jika memungkinkan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // Bergantung pada items

  // useEffect TERPISAH untuk mengatur speed dan direction
  useEffect(() => {
    // Definisi fungsi dipindahkan ke dalam useEffect
    const getDirection = () => {
      if (containerRef.current) {
        if (direction === "left") {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "forwards"
          );
        } else {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "reverse"
          );
        }
      }
    };

    const getSpeed = () => {
      if (containerRef.current) {
        if (speed === "fast") {
          containerRef.current.style.setProperty("--animation-duration", "20s");
        } else if (speed === "normal") {
          containerRef.current.style.setProperty("--animation-duration", "40s");
        } else {
          // Default to slow
          containerRef.current.style.setProperty("--animation-duration", "80s");
        }
      }
    };

    // Panggil fungsi setelah didefinisikan di dalam effect
    getDirection();
    getSpeed();
  }, [direction, speed]); // Bergantung pada direction dan speed

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] bg-blue-600", // Background dari user
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll", // Pastikan 'animate-scroll' ada di CSS global
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items?.map((item, idx) => (
          <li
            // Styling list item dari user
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-100 bg-white px-8 py-6 shadow-sm md:w-[450px] dark:border-white dark:bg-white"
            key={`${item.name || "item"}-${idx}`} // Key lebih aman
          >
            <blockquote>
              {/* Styling teks dari user */}
              <span className="relative z-20 text-sm leading-[1.6] font-normal text-gray-800 dark:text-gray-900">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  {/* Styling teks dari user */}
                  <span className="text-sm leading-[1.6] font-semibold text-gray-600 dark:text-gray-900">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] font-normal text-gray-500 dark:text-gray-900">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Data Testimonials (Tidak berubah)
const testimonials = [
  {
    quote:
      "Pasifix benar-benar mengubah cara saya mendapatkan seafood segar! Pesanannya cepat sampai dan kualitas ikannya luar biasa. Sangat direkomendasikan!",
    name: "Budi Santoso",
    title: "Pelanggan Setia, Yogyakarta",
  },
  {
    quote:
      "Awalnya ragu pesan ikan online, tapi Pasifix membuktikan keraguan saya salah. Ikannya segar seperti baru ditangkap dari laut. Harganya juga bersaing.",
    name: "Siti Aminah",
    title: "Ibu Rumah Tangga, Bantul",
  },
  {
    quote:
      "Sebagai pemilik restoran, kualitas bahan baku adalah nomor satu. Pasifix selalu menyediakan seafood dengan kualitas terbaik dan konsisten. Pengiriman selalu tepat waktu.",
    name: "Chef Anton",
    title: "Pemilik Restoran Seafood 'Bahari Rasa'",
  },
  {
    quote:
      "Platformnya mudah digunakan, pilihan ikannya banyak. Saya suka fitur kategori dan informasi detail produknya. Memudahkan sekali untuk memilih.",
    name: "Dewi Lestari",
    title: "Karyawan Swasta, Sleman",
  },
  {
    quote:
      "Saya baru pertama kali mencoba Pasifix dan langsung puas. Proses pemesanan mudah, admin responsif, dan yang paling penting, ikannya segar banget!",
    name: "Rizky Pratama",
    title: "Mahasiswa, Yogyakarta",
  },
];

// Komponen Demo (Wrapper)
export function InfiniteMovingCardsDemo() {
  return (
    // Styling container demo dari user
    <div className="pb-10 pt-4 md:pt-8 rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-blue-600 dark:bg-grid-white/[0.05]">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-6 md:mb-10">
        Apa Kata Mereka Tentang Pasifix?
      </h2>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow" // Prop speed diteruskan
        pauseOnHover={true}
      />
    </div>
  );
}

// Anda bisa ekspor salah satu atau keduanya
// export default InfiniteMovingCardsDemo;
