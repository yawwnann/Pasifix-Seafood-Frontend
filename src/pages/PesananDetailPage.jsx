// src/pages/PesananDetailPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path apiClient Anda
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  TagIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  XCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheckCircleIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const formatRupiah = (angka) => {
  if (angka === null || angka === undefined || isNaN(Number(angka)))
    return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(angka));
};

const StatusPesananDisplay = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let Icon = InformationCircleIcon;
  let text = status || "Tidak Diketahui";
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    case "baru":
    case "pending":
      colorClass = "bg-blue-100 text-blue-800";
      Icon = ShoppingBagIcon;
      break;
    case "menunggu_konfirmasi_pembayaran":
      colorClass =
        "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-300";
      Icon = ClockIcon;
      break;
    case "lunas":
      colorClass =
        "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200";
      Icon = ShieldCheckIcon;
      break;
    case "diproses":
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = ArrowPathIcon;
      break;
    case "dikirim":
      colorClass = "bg-cyan-100 text-cyan-700";
      Icon = ShoppingBagIcon;
      break;
    case "selesai":
      colorClass = "bg-green-100 text-green-700";
      Icon = SolidCheckCircleIcon;
      break;
    case "dibatalkan":
    case "batal":
      colorClass = "bg-red-100 text-red-700";
      Icon = XCircleIcon;
      break;
    default:
      text = "N/A";
      Icon = InformationCircleIcon;
      break;
  }
  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      <Icon
        className={`h-4 w-4 mr-1.5 ${
          Icon === ArrowPathIcon && lowerStatus === "diproses"
            ? "animate-spin"
            : ""
        }`}
      />
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </span>
  );
};

const StatusPembayaranDisplay = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let Icon = InformationCircleIcon;
  let text = status || "Belum Ada Info";
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    case "pending":
    case "menunggu_pembayaran":
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = ClockIcon;
      break;
    case "paid":
    case "settlement":
    case "capture":
    case "lunas":
      colorClass = "bg-green-100 text-green-700";
      Icon = ShieldCheckIcon;
      text = "Lunas";
      break;
    case "challenge":
      colorClass = "bg-orange-100 text-orange-700";
      Icon = ExclamationTriangleIcon;
      text = "Challenge";
      break;
    case "failure":
    case "failed":
    case "deny":
    case "cancel":
    case "cancelled":
    case "expire":
    case "expired":
      colorClass = "bg-red-100 text-red-700";
      Icon = XCircleIcon;
      text = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Gagal/Batal";
      break;
    default:
      text = "N/A";
      Icon = InformationCircleIcon;
      break;
  }
  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {text}
    </span>
  );
};

const DetailSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-1/3 ml-auto mt-4"></div>
    </div>
  </div>
);

const DetailItem = ({ label, value, icon: IconComponent, className = "" }) => (
  <div className={`sm:col-span-1 ${className}`}>
    <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
      {IconComponent && (
        <IconComponent className="h-4 w-4 mr-1.5 text-gray-400" />
      )}
      {label}
    </dt>
    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium">
      {value || "-"}
    </dd>
  </div>
);

function PesananDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setError("ID Pesanan tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/pesanan/${orderId}`);
      if (response.data?.data) {
        console.log(
          "Data Detail Pesanan Diterima dari API:",
          response.data.data
        ); // Log data mentah
        setOrder(response.data.data);
      } else {
        setError("Gagal memuat detail pesanan: Format data tidak valid.");
        setOrder(null);
        console.warn("Format data detail pesanan tidak sesuai:", response.data);
      }
    } catch (err) {
      console.error(`Gagal memuat detail pesanan ID ${orderId}:`, err);
      if (err.response) {
        if (err.response.status === 404) {
          setError("Pesanan tidak ditemukan.");
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError(
            "Anda tidak diizinkan melihat pesanan ini. Silakan login ulang."
          );
          setTimeout(
            () =>
              navigate("/login", {
                replace: true,
                state: { from: `/pesanan/detail/${orderId}` },
              }),
            3000
          );
        } else {
          setError(
            `Gagal memuat detail pesanan. Server: ${
              err.response.statusText || "Error"
            }`
          );
        }
      } else {
        setError("Gagal memuat detail pesanan. Periksa koneksi Anda.");
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleImageError = (e) => {
    // Mencegah loop jika placeholder itu sendiri gagal dimuat
    if (!e.target.src.endsWith("/placeholder-image.png")) {
      e.target.onerror = null; // Hapus handler untuk mencegah loop tak terbatas
      e.target.src = "/placeholder-image.png"; // Ganti dengan path placeholder Anda yang valid
    } else {
      // Jika placeholder sudah dicoba dan masih error, hentikan saja.
      e.target.onerror = null;
      console.error("Placeholder image juga gagal dimuat:", e.target.alt);
      // Anda bisa menyembunyikan gambar atau menampilkan ikon gambar rusak standar browser
      // e.target.style.display = 'none';
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link
          to="/PesananPage"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1.5 transition-transform duration-150 group-hover:-translate-x-1" />
          Kembali ke Riwayat Pesanan
        </Link>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="text-center py-10 bg-white border border-red-200 rounded-xl shadow-lg">
            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : !order ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <InformationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="text-gray-600">
              Detail pesanan yang Anda cari tidak dapat ditampilkan.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Detail Pesanan
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    ID Internal: <span className="font-mono">#{order.id}</span>
                    {order.midtrans_order_id && (
                      <span className="font-mono">
                        {" "}
                        / Midtrans: {order.midtrans_order_id}
                      </span>
                    )}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <StatusPesananDisplay status={order.status} />
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem
                  label="Tanggal Pesan"
                  value={format(
                    new Date(order.tanggal_pesan || order.created_at),
                    "EEEE, dd MMMM yyyy, HH:mm",
                    { locale: id }
                  )}
                  icon={CalendarDaysIcon}
                  className="sm:col-span-2"
                />
                <DetailItem
                  label="Status Pembayaran"
                  value={
                    <StatusPembayaranDisplay status={order.status_pembayaran} />
                  }
                  icon={CreditCardIcon}
                />
                <DetailItem
                  label="Metode Pembayaran"
                  value={order.metode_pembayaran || "-"}
                  icon={TagIcon}
                />
                {order.midtrans_transaction_id && (
                  <DetailItem
                    label="Transaction ID (Midtrans)"
                    value={order.midtrans_transaction_id}
                    icon={TagIcon}
                    className="sm:col-span-2 font-mono text-xs"
                  />
                )}
              </dl>
            </div>

            {order.payment_proof_url && (
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                  <PhotoIcon className="h-6 w-6 mr-2 text-indigo-600" /> Bukti
                  Pembayaran
                </h2>
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={order.payment_proof_url}
                    alt={`Bukti Pembayaran Pesanan ${order.id}`}
                    className="w-full h-auto max-h-96 rounded-md border border-gray-300 shadow-sm object-contain bg-gray-50"
                    style={{ display: "block", margin: "0 auto" }}
                    onError={handleImageError} // Tambahkan error handler untuk bukti pembayaran juga
                  />
                </a>
                <p className="text-center mt-3">
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Lihat gambar ukuran penuh
                  </a>
                </p>
              </div>
            )}

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
                Info Pelanggan & Pengiriman
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem
                  label="Nama Penerima"
                  value={order.nama_pelanggan}
                  icon={UserCircleIcon}
                />
                <DetailItem
                  label="Nomor WhatsApp"
                  value={order.nomor_whatsapp}
                  icon={PhoneIcon}
                />
                <div className="sm:col-span-2">
                  <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                    Alamat Pengiriman
                  </dt>
                  <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium whitespace-pre-line">
                    {order.alamat_pengiriman || "-"}
                  </dd>
                </div>
                {order.catatan && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
                      <PencilIcon className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                      Catatan Pelanggan
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium whitespace-pre-line">
                      {order.catatan}
                    </dd>
                  </div>
                )}
                {order.user && (
                  <div className="sm:col-span-2 pt-4 border-t mt-4">
                    <dt className="text-xs sm:text-sm text-gray-500">
                      Akun Pemesan
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium">
                      {order.user.name} ({order.user.email})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-800 px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200">
                Item Dipesan
              </h2>
              <ul role="list" className="divide-y divide-slate-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    // Tambahkan console.log di sini untuk memeriksa item.gambar_utama
                    // console.log(`Item ${index} (${item.nama_ikan}): gambar_utama = `, item.gambar_utama);

                    const imageUrl = item.gambar_utama
                      ? `https://res.cloudinary.com/dm3icigfr/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${item.gambar_utama}`
                      : "/placeholder-image.png";

                    return (
                      <li
                        key={item.ikan_id || item.id || `item-idx-${index}`}
                        className="flex flex-col sm:flex-row py-4 px-6 sm:px-8 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24">
                          <img
                            src={imageUrl}
                            alt={item.nama_ikan || "Gambar Ikan"}
                            className="h-full w-full rounded-lg object-cover bg-gray-100 shadow-sm"
                            onError={handleImageError} // Menggunakan handler yang sudah didefinisikan
                          />
                        </div>
                        <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 flex flex-1 flex-col">
                          <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                              <h3 className="text-lg">
                                {item.nama_ikan || "Nama Item Tidak Ada"}
                              </h3>
                              <p className="sm:ml-4 mt-1 sm:mt-0 text-gray-800">
                                {formatRupiah(
                                  item.subtotal ||
                                    item.harga_saat_pesan * item.jumlah ||
                                    0
                                )}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Harga Satuan:{" "}
                              {formatRupiah(item.harga_saat_pesan || 0)}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm mt-2">
                            <p className="text-gray-500">
                              Qty: {item.jumlah || 0}
                            </p>
                            {item.slug && (
                              <div className="flex">
                                <Link
                                  to={`/ikan/${item.slug}`}
                                  className="font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  Lihat Produk
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-6 sm:px-8 py-6 text-center text-gray-500">
                    <ShoppingBagIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    Tidak ada item dalam pesanan ini.
                  </li>
                )}
              </ul>
              <div className="border-t border-slate-200 px-6 sm:px-8 py-5 bg-slate-50">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <p>Total Pesanan</p>
                  <p className="text-indigo-700">
                    {formatRupiah(order.total_harga)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PesananDetailPage;
