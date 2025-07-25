import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // 1. Impor ScrollTrigger

import laptopImage from "../assets/dashboard/LaptopDashboard.png";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  CheckCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { InfiniteMovingCardsDemo } from "../ui/infinite-moving-cards";

function Dashboard() {
  const [ikanList, setIkanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  // 2. Registrasi Plugin ScrollTrigger sekali saat komponen mount
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  const fetchIkan = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/ikan?page=${page}`);
      setIkanList(response.data.data);
      setPagination(response.data.links);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIkan();
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const viewDetail = (slug) => {
    navigate(`/ikan/${slug}`);
  };

  useEffect(() => {
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
    );
    gsap.fromTo(
      ".hero-description",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
    );
    gsap.fromTo(
      ".hero-buttons",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power2.out" }
    );
    gsap.fromTo(
      ".hero-image",
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 1, delay: 0.5, ease: "power3.out" }
    );

    // Animasi Tujuan Heading (Dipicu Scroll)
    gsap.fromTo(
      ".tujuan-heading",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tujuan-heading",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // Animasi Stats Items (Dipicu Scroll - Gunakan grid sebagai trigger)
    gsap.fromTo(
      ".stats-item",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    // Animasi Katalog Heading (Dipicu Scroll)
    gsap.fromTo(
      ".katalog-heading",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".katalog-heading",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // Animasi Benefit Heading (Dipicu Scroll)
    gsap.fromTo(
      ".benefit-heading",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".benefit-heading",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // Animasi Benefit Cards (Dipicu Scroll - Gunakan grid sebagai trigger)
    gsap.fromTo(
      ".benefit-card",
      { opacity: 0, scale: 0.9, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".benefit-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    // Animasi Testimonials Section Wrapper (Dipicu Scroll)
    gsap.fromTo(
      ".testimonials-section",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".testimonials-section",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []); // Hanya run sekali saat mount untuk setup trigger

  // Animasi untuk Ikan Cards (Dipicu Scroll SETELAH loading selesai)
  useEffect(() => {
    if (!loading && ikanList.length > 0) {
      gsap.fromTo(
        ".ikan-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          overwrite: "auto",
          scrollTrigger: {
            trigger: ".ikan-grid", // Gunakan grid container sebagai pemicu
            start: "top 80%", // Mulai saat 80% grid masuk viewport
            toggleActions: "play none none none", // Hanya mainkan sekali
          },
        }
      );
    }
    // Kita tidak perlu cleanup eksplisit untuk animasi `play none none none` sederhana ini
    // Tapi jika animasi lebih kompleks, Anda mungkin perlu return fungsi cleanup di useEffect
  }, [loading, ikanList]); // Jalankan lagi jika loading atau ikanList berubah

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <section className="relative w-full bg-blue-600 text-white overflow-hidden">
        {/* ... Hero Section JSX ... */}
        <div className="container mx-auto px-6 py-24 md:py-32 lg:py-40 relative z-10">
          <div className="max-w-xl lg:max-w-2xl text-center md:text-left relative z-10">
            <h1 className="hero-title text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
              Selamat Datang di Pasifix Seafood!
            </h1>
            <p className="hero-description text-lg lg:text-xl text-blue-100 mb-8">
              Kelola pesanan ikan segar Anda, lihat produk terbaru, dan atur
              profil Anda dengan mudah di sini.
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/keranjang')}
                className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Lihat Pesanan
              </button>
              <button
                type="button"
                onClick={() => navigate('/katalog')}
                className="px-6 py-3 bg-transparent text-white font-semibold rounded-lg shadow-md border-2 border-white hover:bg-white hover:text-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Jelajahi Produk
              </button>
            </div>
          </div>
        </div>
        <img
          src={laptopImage}
          alt="Ilustrasi Dashboard"
          className="hero-image absolute right-0 bottom-0 w-3/4 sm:w-2/3 md:w-3/5 lg:w-2/5 xl:w-2/5 h-auto opacity-90 z-0 object-contain pointer-events-none"
        />
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="tujuan-heading text-3xl font-bold text-gray-800 mb-12">
          TUJUAN KAMI ADALAH <span className="text-blue-600">MENINGKATKAN</span>{" "}
          DAN <span className="text-blue-600">MENGHADIRKAN</span> PRODUK IKAN
          SEGAR
        </h2>
        {/* Tambahkan kelas 'stats-grid' di sini */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-blue-600">
              12.5M+
            </span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Ikan Terjual (Kg)
            </p>
          </div>
          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-gray-800">12K+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Pesanan Harian
            </p>
          </div>
          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-gray-800">725+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Mitra Nelayan
            </p>
          </div>
          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-gray-800">1M+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Pelanggan Puas
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 ">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h3 className="katalog-heading text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-0">
              Katalog Ikan Terbaru
            </h3>
            {ikanList.length > 8 && (
              <div className="text-center md:text-right">
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105">
                  <a href="/katalog"> Lihat Semua </a>
                </button>
              </div>
            )}
          </div>
          {/* Tambahkan kelas 'ikan-grid' di sini */}
          <div className="ikan-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-5">
                      <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-6 w-1/3 bg-gray-300 rounded mb-5"></div>
                      <div className="h-10 w-full bg-gray-400 rounded-lg"></div>
                    </div>
                  </div>
                ))
              : ikanList.slice(0, 8).map((ikan) => (
                  <div
                    key={ikan.id}
                    className="ikan-card group bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-full transform hover:-translate-y-1"
                  >
                    {/* ... isi card ikan ... */}
                    <div className="relative overflow-hidden">
                      <img
                        src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
                        alt={ikan.nama}
                        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                        {ikan.nama}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                        {ikan.deskripsi || "Deskripsi ikan belum tersedia."}
                      </p>
                      <p className="text-2xl font-extrabold text-blue-600 mb-4">
                        {formatRupiah(ikan.harga)}
                      </p>
                      <button
                        onClick={() => viewDetail(ikan.slug)}
                        className="mt-auto w-full py-2.5 px-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                      >
                        <ShoppingCartIcon className="w-5 h-5" />
                        <span>Lihat Detail</span>
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="benefit-heading text-3xl font-bold text-gray-800 mb-12">
          Kenapa Memilih Pasifix?
        </h2>
        {/* Tambahkan kelas 'benefit-grid' di sini */}
        <div className="benefit-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="benefit-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-left font-bold text-gray-800">
                100% Kualitas Terjamin
              </h3>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>
            <p className="text-gray-600 text-left">
              Kami hanya menyediakan ikan berkualitas dengan jaminan keaslian
              dan kesegaran yang terjaga.
            </p>
          </div>
          <div className="benefit-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-left font-bold text-gray-800">
                Pengiriman Cepat & Aman
              </h3>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
                <TruckIcon className="h-8 w-8" />
              </div>
            </div>
            <p className="text-gray-600 text-left">
              Pengiriman cepat dengan berbagai opsi, menjamin ikan sampai tepat
              waktu dan dalam kondisi baik.
            </p>
          </div>
          <div className="benefit-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-left text-gray-800">
                Harga Kompetitif
              </h3>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
                <TagIcon className="h-8 w-8" />
              </div>
            </div>
            <p className="text-gray-600 text-left">
              Menawarkan harga yang bersaing dan banyak promo khusus untuk
              setiap pembelian ikan segar.
            </p>
          </div>
        </div>
      </section>

      {/* Tambahkan kelas 'testimonials-section' di sini */}
      <section className="testimonials-section mt-12 bg-gray-50 py-4">
        <InfiniteMovingCardsDemo />
      </section>
    </div>
  );
}

export default Dashboard;
