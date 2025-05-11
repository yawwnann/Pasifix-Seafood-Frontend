// src/components/ImageSlider.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/effect-creative"; // Atau efek lain & CSS-nya

// Sesuaikan modul yang Anda gunakan (contoh pakai Creative)
import { Pagination, Autoplay, EffectCreative } from "swiper/modules";

// Import gambar Anda
import imgFrame208 from "../assets/dashboard/Frame 208.png";
import imgFrame209 from "../assets/dashboard/Frame 209.png";
import imgGroup180 from "../assets/dashboard/Group 180.png";

const sliderImages = [
  { id: 1, src: imgFrame208, alt: "Background 1" },
  { id: 2, src: imgFrame209, alt: "Background 2" },
  { id: 3, src: imgGroup180, alt: "Background 3" },
];

function ImageSlider() {
  return (
    // Kontainer: Posisi fixed, penuhi layar, di lapisan belakang (z-0)
    <div className="fixed inset-0 w-screen h-screen z-0">
      <Swiper
        modules={[Pagination, Autoplay, EffectCreative]} // Sesuaikan modul
        effect={"creative"} // Sesuaikan efek
        creativeEffect={{
          // Sesuaikan konfigurasi efek
          prev: {
            shadow: false, // Bayangan mungkin tidak perlu untuk background
            translate: ["-100%", 0, -1],
            opacity: 0.5,
          },
          next: {
            translate: ["100%", 0, 0],
            opacity: 1,
          },
        }}
        pagination={false} // Pagination mungkin tidak perlu untuk background
        loop={true}
        autoplay={{
          delay: 4000, // Mungkin sedikit lebih lama untuk background
          disableOnInteraction: false,
        }}
        speed={1000} // Kecepatan transisi
        slidesPerView={1}
        spaceBetween={0}
        allowTouchMove={false} // Nonaktifkan swipe pada background
        className="myBackgroundSwiper w-full h-full" // Pastikan Swiper penuhi kontainer
      >
        {/* Opsional: Overlay gelap di atas gambar untuk kontras konten */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {sliderImages.map((image) => (
          <SwiperSlide key={image.id}>
            <img
              src={image.src}
              alt={image.alt}
              // Gunakan object-cover agar gambar menutupi area slide
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default ImageSlider;
