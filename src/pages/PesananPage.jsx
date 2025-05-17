import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path
import {
  EyeIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon, // Untuk paginasi
  ChevronRightIcon, // Untuk paginasi
  InboxIcon, // Untuk state kosong yang lebih menarik
} from "@heroicons/react/24/outline";
import { format } from "date-fns"; // Untuk format tanggal
import { id } from "date-fns/locale"; // Locale Bahasa Indonesia untuk tanggal

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// Helper Function: Warna Badge Status Pesanan (Sedikit penyesuaian warna)
const getStatusPesananColor = (status) => {
  switch (status?.toLowerCase()) {
    case "baru":
      return "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200";
    case "diproses":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200";
    case "dikirim":
      return "bg-cyan-100 text-cyan-700 ring-1 ring-inset ring-cyan-200";
    case "selesai":
      return "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200";
    case "batal":
      return "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
};

// Helper Function: Warna Badge Status Pembayaran (Sedikit penyesuaian warna)
const getStatusPembayaranColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200";
    case "paid":
    case "settlement":
    case "capture":
      return "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200";
    case "challenge":
      return "bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200";
    case "failure":
    case "failed":
    case "deny":
    case "cancel":
    case "cancelled":
    case "expire":
    case "expired":
      return "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
};

// --- Komponen Skeleton (Disesuaikan) ---
const OrderRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-5 whitespace-nowrap text-sm">
      {" "}
      {/* Padding disesuaikan */}
      <div className="h-4 bg-slate-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-sm">
      <div className="h-4 bg-slate-200 rounded w-36"></div>
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-sm">
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>{" "}
      {/* Badge skeleton */}
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-sm">
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>{" "}
      {/* Badge skeleton */}
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-sm">
      <div className="h-4 bg-slate-200 rounded w-28"></div>
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
      <div className="h-9 bg-slate-200 rounded-md w-24"></div>{" "}
      {/* Tombol skeleton */}
    </td>
  </tr>
);

// --- Komponen Utama ---
function PesananPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/pesanan", {
        params: { page },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
        setPaginationData({
          meta: response.data.meta,
          links: response.data.links,
        });
      } else {
        console.warn("Format data pesanan tidak sesuai:", response.data);
        setOrders([]);
        setPaginationData(null);
        setError("Format data pesanan dari server tidak sesuai.");
      }
    } catch (err) {
      console.error("Gagal memuat riwayat pesanan:", err);
      if (err.response && err.response.status === 401) {
        setError(
          "Sesi Anda telah berakhir. Mohon login kembali untuk melihat riwayat pesanan Anda."
        );
        setTimeout(
          () =>
            navigate("/login", {
              replace: true,
              state: { from: "/profile/pesanan" }, // Pastikan rute ini sesuai
            }),
          3500
        );
      } else {
        setError(
          "Gagal memuat riwayat pesanan. Silakan coba lagi dalam beberapa saat."
        );
      }
      setOrders([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (
      page >= 1 &&
      page <= (paginationData?.meta?.last_page || 1) &&
      page !== currentPage
    ) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fungsi untuk membuat tombol paginasi individual
  const renderPageNumbers = () => {
    if (!paginationData || !paginationData.meta) return null;

    const { current_page, last_page } = paginationData.meta;
    const pageNumbers = [];
    const maxPagesToShow = 5; // Jumlah maksimal tombol halaman yang ditampilkan (selain prev/next)
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, current_page - halfPagesToShow);
    let endPage = Math.min(last_page, current_page + halfPagesToShow);

    if (current_page <= halfPagesToShow) {
      endPage = Math.min(last_page, maxPagesToShow);
    }
    if (current_page + halfPagesToShow >= last_page) {
      startPage = Math.max(1, last_page - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="start-ellipsis"
            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          aria-current={current_page === i ? "page" : undefined}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            current_page === i
              ? "z-10 bg-blue-600 text-white focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              : "text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < last_page) {
      if (endPage < last_page - 1) {
        pageNumbers.push(
          <span
            key="end-ellipsis"
            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700"
          >
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={last_page}
          onClick={() => handlePageChange(last_page)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
        >
          {last_page}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 sm:py-12">
      {" "}
      {/* Background lebih cerah */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10 text-center">
          <ShoppingBagIcon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-3" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            Riwayat Pesanan Saya
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Lihat dan lacak semua transaksi pembelian Anda di sini.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-md shadow-md flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Terjadi Kesalahan</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {" "}
          {/* Shadow lebih tegas */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                {" "}
                {/* Header tabel lebih lembut */}
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    ID Pesanan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Status Bayar
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Status Pesanan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <OrderRowSkeleton key={index} />
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      {" "}
                      {/* Efek hover */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700">
                        {format(
                          new Date(
                            order.created_at ||
                              order.tanggal_pesan ||
                              Date.now()
                          ), // Fallback jika tanggal null
                          "dd MMMM yyyy", // Format lebih lengkap
                          { locale: id }
                        )}
                        <div className="text-xs text-slate-500">
                          {format(
                            new Date(
                              order.created_at ||
                                order.tanggal_pesan ||
                                Date.now()
                            ),
                            "HH:mm",
                            { locale: id }
                          )}{" "}
                          WIB
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-mono">
                        {order.midtrans_order_id || `#${order.id}`}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPembayaranColor(
                            order.status_pembayaran
                          )}`}
                        >
                          {order.status_pembayaran
                            ? order.status_pembayaran.charAt(0).toUpperCase() +
                              order.status_pembayaran.slice(1).toLowerCase() // Pastikan konsisten
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPesananColor(
                            order.status
                          )}`}
                        >
                          {order.status
                            ? order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-800 font-semibold">
                        {formatRupiah(order.total_harga)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/pesanan/detail/${order.id}`} // Pastikan rute detail benar
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center py-2 px-3 rounded-md hover:bg-blue-50 transition-all duration-150 group"
                        >
                          <EyeIcon className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />{" "}
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16 px-6">
                      {" "}
                      {/* Padding lebih besar */}
                      <InboxIcon className="h-16 w-16 text-slate-300 mx-auto mb-5" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-1">
                        Belum Ada Riwayat Pesanan
                      </h3>
                      <p className="text-slate-500 text-sm mb-6">
                        Semua pesanan yang Anda buat akan muncul di sini.
                      </p>
                      <Link
                        to="/katalog" // Arahkan ke halaman katalog atau produk
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <ShoppingBagIcon className="h-5 w-5 mr-2 -ml-1" />
                        Mulai Belanja Sekarang
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginasi yang Ditingkatkan */}
        {paginationData &&
          paginationData.meta &&
          paginationData.meta.last_page > 1 &&
          !loading && (
            <nav
              className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-4 sm:px-6 mt-8 rounded-b-lg shadow-xl" // Shadow sama dengan tabel
              aria-label="Pagination"
            >
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-900">
                      {paginationData.meta.from || 0}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-slate-900">
                      {paginationData.meta.to || 0}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-900">
                      {paginationData.meta.total || 0}
                    </span>{" "}
                    hasil
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!paginationData.links?.prev}
                      className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 ${
                        !paginationData.links?.prev
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Sebelumnya</span>
                    </button>
                    {renderPageNumbers()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!paginationData.links?.next}
                      className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 ${
                        !paginationData.links?.next
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="sr-only">Berikutnya</span>
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
              {/* Paginasi Mobile */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.links?.prev}
                  className={`relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium ${
                    !paginationData.links?.prev
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.links?.next}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium ${
                    !paginationData.links?.next
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          )}
      </div>
    </div>
  );
}

export default PesananPage;
