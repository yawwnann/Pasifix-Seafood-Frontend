"use client"; // Jika Anda menggunakan Next.js App Router

import React, {
  useState,
  useEffect,
  // useMemo, // Hapus jika tidak digunakan, atau uncomment jika akan dipakai
} from "react";
import apiClient from "../api/apiClient"; // Sesuaikan path
import { useNavigate, Link, useSearchParams } from "react-router-dom"; // <-- useSearchParams diimpor
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
} from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { cn } from "../lib/utils"; // Sesuaikan path

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
// (Menggunakan IkanCard yang sudah ada dan disempurnakan sebelumnya)
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const viewDetail = (e) => {
    if (e.target.closest("button")) {
      return;
    }
    navigate(`/ikan/${ikan?.slug || ikan?.id}`);
  };

  const statusKetersediaan = ikan?.status_ketersediaan?.toLowerCase();
  const isTersedia = statusKetersediaan === "tersedia";

  const statusBadgeColor = isTersedia
    ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200"
    : "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200";

  const namaIkanDisplay =
    ikan?.nama_ikan || ikan?.nama || "Nama Ikan Tidak Ada";
  const gambarUtama = ikan?.gambar_utama;
  const hargaIkan = ikan?.harga;
  const kategoriNama = ikan?.kategori_nama || ikan?.kategori?.nama;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
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
          errorMessage = "Login dulu";
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
    <div className="ikan-card group bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full relative shadow-lg hover:border-blue-300">
      {feedback.message && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-30 p-1.5 text-center text-xs font-semibold transition-all duration-300",
            feedback.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {feedback.message}
        </div>
      )}
      <div
        className="relative overflow-hidden aspect-w-4 aspect-h-3 cursor-pointer"
        onClick={viewDetail}
      >
        <img
          src={
            gambarUtama
              ? `https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${gambarUtama}`
              : "https://placehold.co/400x300/e2e8f0/94a3b8?text=Gambar"
          }
          alt={namaIkanDisplay}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x300/fecaca/991b1b?text=Error";
          }}
        />
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col space-y-1.5">
          {kategoriNama && (
            <span className="bg-blue-600 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
              {kategoriNama}
            </span>
          )}
          {statusKetersediaan && (
            <span
              className={cn(
                "text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide",
                statusBadgeColor
              )}
            >
              {statusKetersediaan.charAt(0).toUpperCase() +
                statusKetersediaan.slice(1)}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3
          className="text-base lg:text-lg font-semibold text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors cursor-pointer"
          onClick={viewDetail}
        >
          {namaIkanDisplay}
        </h3>
        <p className="text-lg lg:text-xl font-bold text-blue-600 mb-4">
          {formatRupiah(hargaIkan)}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              viewDetail(e);
            }}
            className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold py-2.5 px-3 rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <EyeIcon className="w-4 h-4 mr-1.5 sm:mr-2" /> Detail
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!isTersedia || isAddingToCart}
            title="Beli Sekarang"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCartIcon className="w-4 h-4 mr-1.5 sm:mr-2" />
            )}
            {isAddingToCart ? "..." : "Beli"}
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
    <nav className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-white px-4 py-5 sm:px-6 mt-10 rounded-lg shadow-md">
      <div className="text-sm text-slate-700 mb-4 sm:mb-0">
        Menampilkan{" "}
        <span className="font-semibold text-slate-900">{meta.from || 0}</span> -{" "}
        <span className="font-semibold text-slate-900">{meta.to || 0}</span>{" "}
        dari{" "}
        <span className="font-semibold text-slate-900">{meta.total || 0}</span>{" "}
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
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            );
          if (isNext)
            labelContent = (
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            );
          if (link.label === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="relative inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 cursor-default"
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
                "relative inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 transition-colors duration-150",
                link.active
                  ? "z-10 bg-blue-600 text-white cursor-default"
                  : !link.url
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-900 hover:bg-slate-100",
                index === 0 && "rounded-l-md",
                index === meta.links.length - 1 && "rounded-r-md",
                (isPrev || isNext) && "px-3"
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
  <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden animate-pulse shadow-lg">
    <div className="aspect-w-4 aspect-h-3 bg-slate-200"></div>
    <div className="p-4 sm:p-5">
      <div className="h-5 w-4/5 bg-slate-200 rounded mb-2.5"></div>
      <div className="h-6 w-2/5 bg-slate-200 rounded mb-4"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-9 w-full bg-slate-200 rounded-lg"></div>
        <div className="h-9 w-full bg-slate-200 rounded-lg"></div>
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
  const [searchParams, setSearchParams] = useSearchParams(); // <-- Inisialisasi useSearchParams

  // State untuk filter & sort, diinisialisasi dari URL atau default
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
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Sinkronisasi state dari URL (jika user navigasi back/forward browser)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const searchFromUrl = searchParams.get("q") || "";
    const sortFromUrl = searchParams.get("sort_by") || "terbaru";
    const availabilityFromUrl = searchParams.get("status_ketersediaan") || "";

    if (pageFromUrl !== currentPage) setCurrentPage(pageFromUrl);
    if (searchFromUrl !== searchQuery) setSearchQuery(searchFromUrl);
    if (sortFromUrl !== selectedSort) setSelectedSort(sortFromUrl);
    if (availabilityFromUrl !== selectedAvailability)
      setSelectedAvailability(availabilityFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchKatalog = async (page, search, sort, availability) => {
    setLoading(true);
    setError(null);
    const params = { page };
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

    // Update URL dengan parameter saat ini
    const newSearchParams = new URLSearchParams();
    if (page > 1) newSearchParams.set("page", page.toString());
    if (search) newSearchParams.set("q", search);
    if (sort !== "terbaru") newSearchParams.set("sort_by", sort);
    if (availability) newSearchParams.set("status_ketersediaan", availability);
    // Hanya panggil setSearchParams jika ada perubahan untuk menghindari loop
    if (searchParams.toString() !== newSearchParams.toString()) {
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
          !response.data ||
          (response.data.data && response.data.data.length === 0)
        ) {
          // Data kosong, bukan error
        } else {
          setError("Format data dari server tidak sesuai.");
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
  };

  useEffect(() => {
    fetchKatalog(
      currentPage,
      debouncedSearch,
      selectedSort,
      selectedAvailability
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability]);

  // Reset ke halaman 1 jika filter/pencarian berubah, TAPI bukan halaman itu sendiri
  useEffect(() => {
    // Hanya reset jika currentPage bukan 1, untuk menghindari trigger fetchKatalog yang tidak perlu jika sudah di halaman 1
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedSort, selectedAvailability]);

  const handlePageChange = (page) => {
    const pageNum = parseInt(page, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= (paginationData?.meta?.last_page || 1)
    ) {
      setCurrentPage(pageNum); // Ini akan memicu useEffect di atas untuk fetch data
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Temukan Seafood Segar Pilihan Anda
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Jelajahi berbagai macam ikan, udang, cumi, dan hasil laut lainnya
            dengan kualitas terbaik, langsung dari sumbernya.
          </p>
        </div>

        {/* Filter dan Kontrol Pencarian - PERBAIKAN CSS CONFLICT */}
        <div className="mb-8 md:mb-10 p-4 sm:p-6 bg-white/80 rounded-xl shadow-lg  top-4 z-20 backdrop-blur-sm">
          {" "}
          {/* Menggunakan bg-white/80 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label
                htmlFor="search-ikan"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                <MagnifyingGlassIcon className="inline h-4 w-4 mr-1 text-slate-500" />{" "}
                Cari Ikan
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-ikan"
                  placeholder="Ketik nama ikan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 hover:bg-slate-100 focus:bg-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="sort-ikan"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                <ArrowsUpDownIcon className="inline h-4 w-4 mr-1 text-slate-500" />{" "}
                Urutkan
              </label>
              <div className="relative">
                <select
                  id="sort-ikan"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="appearance-none w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 hover:bg-slate-100 focus:bg-white cursor-pointer"
                >
                  <option value="terbaru">Paling Baru</option>
                  <option value="harga_asc">Harga: Terendah</option>
                  <option value="harga_desc">Harga: Tertinggi</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="filter-ketersediaan"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                <FunnelIcon className="inline h-4 w-4 mr-1 text-slate-500" />{" "}
                Ketersediaan
              </label>
              <div className="relative">
                <select
                  id="filter-ketersediaan"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="appearance-none w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 hover:bg-slate-100 focus:bg-white cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="habis">Stok Habis</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Terjadi Kesalahan</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {loading
            ? Array.from({ length: paginationData?.meta?.per_page || 8 }).map(
                (_, index) => <SkeletonCard key={`skeleton-${index}`} />
              )
            : ikanList.length > 0
            ? ikanList.map((ikan) => <IkanCard key={ikan.id} ikan={ikan} />)
            : !error && (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <InboxIcon className="mx-auto h-16 w-16 md:h-20 md:w-20 text-slate-300" />
                  <h3 className="mt-4 text-xl md:text-2xl font-semibold text-slate-800">
                    Tidak Ada Hasil Ditemukan
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-slate-500 max-w-md mx-auto">
                    Coba ubah kata kunci pencarian atau filter Anda untuk
                    menemukan produk yang diinginkan.
                  </p>
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
