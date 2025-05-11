"use client";

import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { ArrowsUpDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";

const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

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

function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const viewDetail = (slug) => navigate(`/ikan/${slug}`);
  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding || ikan.status_ketersediaan?.toLowerCase() !== "tersedia")
      return;
    setIsAdding(true);
    setFeedback({ type: "", message: "" });

    try {
      await apiClient.post("/keranjang", { ikan_id: ikan.id, quantity: 1 });
      setFeedback({ type: "success", message: `${ikan.nama} ditambahkan!` });
      setTimeout(() => setFeedback({ type: "", message: "" }), 2500);
    } catch (err) {
      let errorMessage = "Gagal menambah ke keranjang.";
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        errorMessage = "Silakan login untuk menambah item.";
      } else if (err.response && err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
      setFeedback({ type: "error", message: errorMessage });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="ikan-card group bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md flex flex-col h-full relative">
      {feedback.message && (
        <div
          className={`absolute inset-x-0 top-0 z-20 p-2 text-center text-xs font-medium transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div
        className="relative overflow-hidden cursor-pointer"
        onClick={() => viewDetail(ikan.slug)}
      >
        <img
          src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
          alt={ikan.nama}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
          {ikan.kategori && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              {ikan.kategori.nama}
            </span>
          )}
          {ikan.status_ketersediaan && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${statusBadgeColor}`}
            >
              {ikan.status_ketersediaan}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div
          onClick={() => viewDetail(ikan.slug)}
          className="cursor-pointer mb-1"
        >
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
            {ikan.nama}
          </h3>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <p
            className="text-lg font-bold text-blue-700 cursor-pointer"
            onClick={() => viewDetail(ikan.slug)}
          >
            {formatRupiah(ikan.harga)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={
              ikan.status_ketersediaan?.toLowerCase() !== "tersedia" || isAdding
            }
            className={cn(
              "p-1.5 sm:p-2 rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex-shrink-0",
              ikan.status_ketersediaan?.toLowerCase() !== "tersedia" || isAdding
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
            title="Tambah ke Keranjang"
          >
            {isAdding ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCartIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const getPageNumber = (url) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("page");
    } catch {
      const match = url.match(/[?&]page=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-10 py-5">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{meta.from || 0}</span> -{" "}
          <span className="font-medium">{meta.to || 0}</span> dari{" "}
          <span className="font-medium">{meta.total || 0}</span> hasil
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end space-x-1">
        {meta.links?.map((link, index) => {
          const pageNumber = getPageNumber(link.url);
          // const isDisabled = !link.url || link.active;
          const isCurrent = link.active;

          if (
            link.label.includes("Previous") ||
            link.label.includes("&laquo;")
          ) {
            return (
              <button
                key={`prev-${index}`}
                onClick={() =>
                  link.url && pageNumber && onPageChange(pageNumber)
                }
                disabled={!link.url}
                className={cn(
                  "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                  !link.url
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                )}
              >
                {link.label.includes("&laquo;") ? (
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                  "Sebelumnya"
                )}
              </button>
            );
          } else if (
            link.label.includes("Next") ||
            link.label.includes("&raquo;")
          ) {
            return (
              <button
                key={`next-${index}`}
                onClick={() =>
                  link.url && pageNumber && onPageChange(pageNumber)
                }
                disabled={!link.url}
                className={cn(
                  "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                  !link.url
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                )}
              >
                {link.label.includes("&raquo;") ? (
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                  "Berikutnya"
                )}
              </button>
            );
          } else if (link.label === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 md:inline-flex cursor-default"
              >
                ...
              </span>
            );
          } else if (pageNumber) {
            return (
              <button
                key={`page-${link.label}-${index}`}
                onClick={() => !isCurrent && onPageChange(pageNumber)}
                disabled={isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 md:inline-flex",
                  isCurrent
                    ? "z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-default"
                    : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                )}
              >
                {link.label}
              </button>
            );
          }
          return null;
        })}
      </div>
    </nav>
  );
}

function KatalogPage() {
  const [ikanList, setIkanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("terbaru");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const fetchKatalog = async (page, search, sort, availability) => {
    setLoading(true);
    setError(null);
    const params = { page };
    if (search) params.q = search;
    if (sort) {
      if (sort === "harga_asc") {
        params.sort = "harga";
        params.order = "asc";
      } else if (sort === "harga_desc") {
        params.sort = "harga";
        params.order = "desc";
      } else {
        params.sort = "created_at";
        params.order = "desc";
      }
    }
    if (availability) params.status_ketersediaan = availability;
    try {
      const response = await apiClient.get("/ikan", { params });
      if (response.data && response.data.data && response.data.meta) {
        setIkanList(response.data.data);
        setPaginationData(response.data);
      } else {
        setIkanList([]);
        setPaginationData(null);
        setError("Format data dari server tidak sesuai.");
      }
    } catch (err_param) {
      // PERBAIKAN: 'err' diganti menjadi 'err_param' atau '_err' karena 'err' dipakai di atas
      console.error("Gagal memuat katalog:", err_param); // Gunakan err_param
      setError("Gagal memuat data ikan. Silakan coba lagi nanti.");
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
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedSort, selectedAvailability, currentPage]);

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Katalog Seafood
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-48 md:w-56">
              <input
                type="text"
                placeholder="Cari nama ikan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-grow sm:flex-grow-0 sm:w-40 md:w-48">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                aria-label="Urutkan berdasarkan"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga Terendah</option>
                <option value="harga_desc">Harga Tertinggi</option>
              </select>
              <svg
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
            <div className="relative flex-grow sm:flex-grow-0 sm:w-40 md:w-48">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                aria-label="Filter berdasarkan ketersediaan"
              >
                <option value="">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="habis">Habis</option>
              </select>
              <svg
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {loading
            ? Array.from({ length: paginationData?.meta?.per_page || 12 }).map(
                (_, index) => <SkeletonCard key={`skeleton-${index}`} />
              )
            : ikanList.length > 0
            ? ikanList.map((ikan) => <IkanCard key={ikan.id} ikan={ikan} />)
            : !error && (
                <p className="col-span-full text-center text-gray-500 py-10">
                  Tidak ada ikan yang cocok dengan pencarian/filter Anda.
                </p>
              )}
        </div>

        {!loading &&
          paginationData?.meta &&
          paginationData.meta.total > (paginationData.meta.per_page || 0) && (
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
