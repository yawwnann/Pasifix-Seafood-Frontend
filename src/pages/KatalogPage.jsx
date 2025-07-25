"use client"; // Jika Anda menggunakan Next.js App Router

import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient"; // Sesuaikan path ke apiClient Anda
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  FunnelIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { cn } from "../lib/utils"; // Sesuaikan path ke utilitas cn Anda

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  const number = typeof angka === "string" ? parseInt(angka, 10) : angka;
  if (isNaN(number) || number === null || number === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Custom Hook: useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Komponen IkanCard ---
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const viewDetail = (e) => {
    // Mencegah navigasi jika tombol beli atau detail atau elemen di dalamnya yang diklik
    if (
      e.target.closest(".add-to-cart-button") ||
      e.target.closest(".view-detail-button")
    ) {
      return;
    }
    navigate(`/ikan/${ikan?.slug || ikan?.id}`);
  };

  const navigateToDetailFromButton = (e) => {
    e.stopPropagation(); // Hentikan propagasi agar onClick pada div utama tidak terpanggil
    navigate(`/ikan/${ikan?.slug || ikan?.id}`);
  };

  const statusKetersediaan = ikan?.status_ketersediaan?.toLowerCase();
  const isTersedia = statusKetersediaan === "tersedia";

  const statusBadgeColor = isTersedia
    ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-600/30"
    : "bg-rose-500/15 text-rose-700 ring-1 ring-inset ring-rose-600/30";

  const namaIkanDisplay =
    ikan?.nama_ikan || ikan?.nama || "Nama Ikan Tidak Tersedia";
  const gambarUtama = ikan?.gambar_utama;
  const hargaIkan = ikan?.harga;
  const kategoriNama = ikan?.kategori_nama || ikan?.kategori?.nama;

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Hentikan propagasi
    if (isAddingToCart || !isTersedia) return;
    setIsAddingToCart(true);
    setFeedback({ type: "", message: "" });
    try {
      await apiClient.post("/keranjang", { ikan_id: ikan.id, quantity: 1 });
      setFeedback({
        type: "success",
        message: `${namaIkanDisplay} ditambahkan!`,
      });
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      setTimeout(() => setFeedback({ type: "", message: "" }), 2000);
    } catch (err) {
      console.error("Gagal menambah ke keranjang (dari Katalog):", err);
      let errorMessage = "Gagal menambahkan";
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Silakan login";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message.substring(0, 30);
        }
      }
      setFeedback({ type: "error", message: errorMessage });
      setTimeout(() => setFeedback({ type: "", message: "" }), 2500);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      className="ikan-card group bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl flex flex-col h-full relative shadow-lg border border-slate-200/80 hover:border-blue-400"
      onClick={viewDetail} // onClick utama untuk navigasi
    >
      {feedback.message && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-30 p-1.5 text-center text-xs font-bold transition-all duration-300",
            feedback.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {feedback.message}
        </div>
      )}
      <div className="relative overflow-hidden aspect-[4/3] cursor-pointer">
        <img
          src={
            gambarUtama
              ? `https://res.cloudinary.com/dm3icigfr/image/upload/w_450,h_338,c_fill,q_auto,f_auto,g_auto/${gambarUtama}`
              : "https://placehold.co/450x338/e2e8f0/94a3b8?text=Gambar+Ikan"
          }
          alt={namaIkanDisplay}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/450x338/fecaca/991b1b?text=Error";
          }}
        />
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col space-y-1.5">
          {kategoriNama && (
            <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm tracking-wide flex items-center">
              <TagIcon className="w-3 h-3 mr-1 opacity-80" /> {kategoriNama}
            </span>
          )}
          {statusKetersediaan && (
            <span
              className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide backdrop-blur-sm",
                statusBadgeColor
              )}
            >
              {statusKetersediaan.charAt(0).toUpperCase() +
                statusKetersediaan.slice(1)}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer">
          {namaIkanDisplay}
        </h3>
        <p className="text-base md:text-lg font-bold text-blue-600 mb-3">
          {formatRupiah(hargaIkan)}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={navigateToDetailFromButton}
            className="view-detail-button w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold py-2.5 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label={`Lihat detail ${namaIkanDisplay}`}
          >
            <EyeIcon className="w-4 h-4 mr-1.5 sm:mr-2" /> Detail
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!isTersedia || isAddingToCart}
            title={isTersedia ? "Beli Sekarang" : "Stok Habis"}
            className="add-to-cart-button w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400/70 disabled:text-slate-100 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:bg-slate-400/70 group/button"
          >
            {isAddingToCart ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCartIcon className="w-4 h-4 mr-1.5 sm:mr-2 transition-transform duration-200 group-hover/button:scale-110" />
            )}
            <span className="transition-all duration-200">
              {isAddingToCart ? "..." : isTersedia ? "Beli" : "Habis"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Komponen Pagination ---
function Pagination({ meta, onPageChange }) {
  if (!meta || !meta.links || meta.last_page <= 1) return null;

  const handlePageClick = (pageUrl) => {
    if (!pageUrl) return;
    try {
      const url = new URL(pageUrl);
      const page = url.searchParams.get("page");
      if (page) onPageChange(page);
    } catch (e) {
      const match = pageUrl.match(/[?&]page=(\d+)/);
      if (match && match[1]) onPageChange(match[1]);
      else console.error("Invalid URL for pagination:", pageUrl, e);
    }
  };

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/70 bg-white/80 backdrop-blur-sm px-4 py-3.5 sm:px-6 mt-8 sm:mt-10 rounded-lg shadow-lg bottom-4 z-10">
      <div className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-0">
        Menampilkan{" "}
        <span className="font-semibold text-slate-800">{meta.from || 0}</span> -{" "}
        <span className="font-semibold text-slate-800">{meta.to || 0}</span>{" "}
        dari{" "}
        <span className="font-semibold text-slate-800">{meta.total || 0}</span>{" "}
        hasil
      </div>
      <div className="isolate inline-flex -space-x-px rounded-md shadow-sm">
        {meta.links.map((link, index) => {
          let labelContent = link.label.replace(/&laquo;|&raquo;/g, "").trim();
          const isPrev =
            link.label.includes("Previous") || link.label.includes("&laquo;");
          const isNext =
            link.label.includes("Next") || link.label.includes("&raquo;");
          if (isPrev)
            labelContent = (
              <>
                <ChevronLeftIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
                <span className="sr-only">Sebelumnya</span>
              </>
            );
          if (isNext)
            labelContent = (
              <>
                <ChevronRightIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
                <span className="sr-only">Berikutnya</span>
              </>
            );
          if (link.label === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="relative inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-300/70 cursor-default"
              >
                {labelContent}
              </span>
            );
          }
          return (
            <button
              key={index}
              onClick={() => handlePageClick(link.url)}
              disabled={!link.url || link.active}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium ring-1 ring-inset ring-slate-300/70 focus:z-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-150 ease-in-out",
                link.active
                  ? "z-10 bg-blue-600 text-white cursor-default ring-blue-600"
                  : !link.url
                  ? "text-slate-400 cursor-not-allowed bg-slate-50/50"
                  : "text-slate-700 bg-white hover:bg-slate-100/70 hover:text-blue-700",
                index === 0 && "rounded-l-md",
                index === meta.links.length - 1 && "rounded-r-md",
                (isPrev || isNext) && "px-2 sm:px-2.5"
              )}
              aria-label={
                isPrev
                  ? "Halaman sebelumnya"
                  : isNext
                  ? "Halaman berikutnya"
                  : `Halaman ${link.label}`
              }
            >
              {labelContent}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// --- Komponen SkeletonCard ---
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-slate-200/70 overflow-hidden animate-pulse shadow-lg">
    <div className="aspect-[4/3] bg-slate-200/80"></div>
    <div className="p-3.5 sm:p-4">
      <div className="h-4 w-4/5 bg-slate-200/80 rounded mb-2"></div>
      <div className="h-5 w-2/5 bg-slate-200/80 rounded mb-3.5"></div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
        <div className="h-9 w-full bg-slate-200/80 rounded-md"></div>
        <div className="h-9 w-full bg-slate-200/80 rounded-md"></div>
      </div>
    </div>
  </div>
);

// --- Komponen Utama KatalogPage ---
function KatalogPage() {
  const [ikanList, setIkanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort_by") || "terbaru"
  );
  const [selectedAvailability, setSelectedAvailability] = useState(
    searchParams.get("status_ketersediaan") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 550);

  // Initialize state from URL only once on mount
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const searchFromUrl = searchParams.get("q") || "";
    const sortFromUrl = searchParams.get("sort_by") || "terbaru";
    const availabilityFromUrl = searchParams.get("status_ketersediaan") || "";

    setCurrentPage(pageFromUrl);
    setSearchQuery(searchFromUrl);
    setSelectedSort(sortFromUrl);
    setSelectedAvailability(availabilityFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent infinite loops

  const fetchKatalog = useCallback(async (page, search, sort, availability) => {
    setLoading(true);
    setError(null);
    const params = { page, per_page: 12 };
    if (search) params.q = search;
    if (sort === "harga_asc") {
      params.sort_by = "harga";
      params.sort_direction = "asc";
    } else if (sort === "harga_desc") {
      params.sort_by = "harga";
      params.sort_direction = "desc";
    } else {
      params.sort_by = "created_at";
      params.sort_direction = "desc";
    }
    if (availability) params.status_ketersediaan = availability;

    const newSearchParams = new URLSearchParams();
    if (page > 1) newSearchParams.set("page", page.toString());
    if (search) newSearchParams.set("q", search);
    if (sort !== "terbaru") newSearchParams.set("sort_by", sort);
    if (availability) newSearchParams.set("status_ketersediaan", availability);

    const currentQs = searchParams.toString();
    const newQs = newSearchParams.toString();

    if (currentQs !== newQs) {
      setSearchParams(newSearchParams, { replace: true });
    }

    try {
      const response = await apiClient.get("/ikan", { params });
      if (
        response.data &&
        response.data.data &&
        response.data.meta &&
        Array.isArray(response.data.data)
      ) {
        setIkanList(response.data.data);
        setPaginationData(response.data);
      } else {
        setIkanList([]);
        setPaginationData(null);
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0 &&
          !response.data.meta
        ) {
          setError("Format data dari server tidak sesuai (meta missing).");
        } else if (!response.data) {
          setError("Tidak ada data diterima dari server.");
        }
      }
    } catch (err) {
      console.error("Gagal memuat katalog:", err);
      let errMsg = "Gagal memuat data ikan. Silakan coba lagi nanti.";
      if (err.response?.data?.message) errMsg = err.response.data.message;
      else if (err.message) errMsg = err.message;
      setError(errMsg);
      setIkanList([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchKatalog(
      currentPage,
      debouncedSearch,
      selectedSort,
      selectedAvailability
    );
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability, fetchKatalog]);

  const handleFilterOrSortChange = (type, value) => {
    let shouldResetPage = false;
    if (type === "search") {
      if (searchQuery !== value) shouldResetPage = true;
      setSearchQuery(value);
    } else if (type === "sort") {
      if (selectedSort !== value) shouldResetPage = true;
      setSelectedSort(value);
    } else if (type === "availability") {
      if (selectedAvailability !== value) shouldResetPage = true;
      setSelectedAvailability(value);
    }
    if (shouldResetPage && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    const pageNum = parseInt(page, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= (paginationData?.meta?.last_page || 1) &&
      pageNum !== currentPage
    ) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedSort("terbaru");
    setSelectedAvailability("");
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-sky-100 min-h-screen ">
      <div className="container mx-auto px-4 sm:px-5 lg:px-6 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-10 ">
          {" "}
          {/* PERHATIKAN: Sesuaikan padding top ini jika layout utama sudah handle offset navbar */}
          <h1 className="text-3xl md:text-4xl lg:text-[2.8rem] font-extrabold tracking-tight text-slate-800">
            Temukan <span className="text-blue-600">Seafood Segar</span>{" "}
            Pilihanmu
          </h1>
          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-slate-600/90 max-w-xl mx-auto">
            Jelajahi beragam hasil laut berkualitas terbaik, langsung dari
            sumbernya untuk kesegaran maksimal.
          </p>
        </div>

        {/* Filter dan Kontrol Pencarian - Sesuaikan 'top-[Xrem]' atau 'top-[Ypx]' dengan tinggi navbar + jarak */}
        <div className="mb-6 md:mb-8 p-3.5 sm:p-4 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl top-[5rem] z-20 border border-slate-200/60">
          {/* GANTI top-[5rem] DENGAN NILAI YANG SESUAI: (tinggi navbar Anda) + (jarak yang diinginkan) */}
          {/* Contoh: jika navbar 70px dan jarak 10px, maka top-[80px] */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end">
            <div className="md:col-span-1">
              <label
                htmlFor="search-ikan"
                className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide"
              >
                <MagnifyingGlassIcon className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
                Cari Produk
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-ikan"
                  placeholder="Cari nama ikan, kategori, atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) =>
                    handleFilterOrSortChange("search", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Trigger immediate search on Enter
                      fetchKatalog(1, searchQuery, selectedSort, selectedAvailability);
                    }
                  }}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70 hover:border-slate-400 focus:bg-white placeholder-slate-400/90"
                />
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleFilterOrSortChange("search", "")}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Hapus pencarian"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="sort-ikan"
                className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide"
              >
                <ArrowsUpDownIcon className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
                Urutkan
              </label>
              <div className="relative">
                <select
                  id="sort-ikan"
                  value={selectedSort}
                  onChange={(e) =>
                    handleFilterOrSortChange("sort", e.target.value)
                  }
                  className="appearance-none w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm border border-slate-300/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 hover:border-slate-400 focus:bg-white cursor-pointer"
                >
                  <option value="terbaru">Paling Baru</option>
                  <option value="harga_asc">Harga: Terendah</option>
                  <option value="harga_desc">Harga: Tertinggi</option>
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="filter-ketersediaan"
                className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide"
              >
                <FunnelIcon className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
                Ketersediaan
              </label>
              <div className="relative">
                <select
                  id="filter-ketersediaan"
                  value={selectedAvailability}
                  onChange={(e) =>
                    handleFilterOrSortChange("availability", e.target.value)
                  }
                  className="appearance-none w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm border border-slate-300/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 hover:border-slate-400 focus:bg-white cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="habis">Stok Habis</option>
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-100/80 border-l-4 border-red-600 text-red-700/90 rounded-md shadow flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2.5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800/90 text-sm">
                Oops, Terjadi Kesalahan!
              </h3>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
          {loading
            ? Array.from({ length: paginationData?.meta?.per_page || 12 }).map(
                (_, index) => <SkeletonCard key={`skeleton-${index}`} />
              )
            : ikanList.length > 0
            ? ikanList.map((ikan) => <IkanCard key={ikan.id} ikan={ikan} />)
            : !error && (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <InboxIcon className="mx-auto h-16 w-16 md:h-20 md:w-20 text-slate-400/70" />
                  <h3 className="mt-4 text-lg md:text-xl font-semibold text-slate-700/90">
                    Yah, Produk Tidak Ditemukan
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500/80 max-w-sm mx-auto">
                    Coba kata kunci lain atau ubah filter untuk menemukan yang
                    Anda cari.
                  </p>
                  {(searchQuery ||
                    selectedSort !== "terbaru" ||
                    selectedAvailability) && (
                    <button
                      onClick={resetAllFilters}
                      className="mt-5 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out text-xs sm:text-sm"
                    >
                      Reset Filter & Pencarian
                    </button>
                  )}
                </div>
              )}
        </div>

        {!loading &&
          paginationData?.meta &&
          paginationData.meta.last_page > 1 && (
            <Pagination
              meta={paginationData.meta}
              onPageChange={handlePageChange}
            />
          )}
      </div>
    </div>
  );
}

export default KatalogPage;
