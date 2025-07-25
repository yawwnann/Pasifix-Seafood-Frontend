import React, { useState, useEffect, Fragment } from "react"; // Impor Fragment
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  ShoppingCartIcon,
  CheckCircleIcon, // Ikon Sukses
  XCircleIcon, // Ikon Gagal
  ChevronLeftIcon,
  MinusIcon,
  PlusIcon,
  ClockIcon, // Ikon Loading
  InformationCircleIcon, // Opsional: Untuk tipe modal info
} from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react"; // Impor Dialog dan Transition
import { cn } from "../lib/utils"; // Pastikan utilitas cn ada atau ganti

// --- Helper Function: Format Rupiah ---
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// --- Komponen: Ikan Card (Untuk Produk Terkait) ---
// Komponen ini digunakan untuk menampilkan produk serupa
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const viewDetail = (slug) => navigate(`/ikan/${slug}`);
  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  // Placeholder add to cart untuk produk terkait (bisa dikembangkan)
  const handleSimpleAddToCart = (e) => {
    e.stopPropagation();
    alert(`Tambah ${ikan.nama} (dari related) (belum implementasi)`);
  };

  return (
    <div className="ikan-card group bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md flex flex-col h-full">
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
      <div className="p-4 flex flex-row justify-between items-end flex-grow">
        <div
          className="flex-grow mr-2 cursor-pointer"
          onClick={() => viewDetail(ikan.slug)}
        >
          <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
            {ikan.nama}
          </h3>
          <p className="text-lg font-bold text-blue-700">
            {formatRupiah(ikan.harga)}
          </p>
        </div>
        <button
          onClick={handleSimpleAddToCart} // Tombol ini masih placeholder
          disabled={ikan.status_ketersediaan?.toLowerCase() !== "tersedia"}
          className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          title="Tambah ke Keranjang"
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// --- Komponen Loading Detail (Skeleton) ---
const DetailLoadingSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
    <div className="mb-6 h-5 w-1/4 bg-gray-300 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">
      <div className="md:col-span-2 w-full aspect-w-1 aspect-h-1 bg-gray-300 rounded-lg"></div>
      <div className="md:col-span-3">
        <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>
        <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
        <div className="h-10 w-1/2 bg-gray-300 rounded mb-6"></div>
        <div className="h-5 w-1/4 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-300 rounded"></div>
          <div className="h-12 w-48 bg-gray-400 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

// --- Komponen Loading Card (Skeleton) untuk related items ---
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// --- Komponen Utama Halaman Detail Ikan ---
function DetailIkanPage() {
  // State Data & UI
  const [ikanDetail, setIkanDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedIkanList, setRelatedIkanList] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  // State Proses Add to Cart
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartStatus, setAddToCartStatus] = useState(null); // 'success', 'error', null

  // State Modal Notifikasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "info",
  }); // type: info, success, error

  const { slug } = useParams();
  const navigate = useNavigate();

  // --- Fungsi Kontrol Modal ---
  function closeModal() {
    setIsModalOpen(false);
    // Optional: beri jeda sebelum reset konten agar transisi halus
    // setTimeout(() => setModalContent({ title: '', message: '', type: 'info' }), 300);
  }

  function openModal(type, title, message) {
    setModalContent({ type, title, message });
    setIsModalOpen(true);
  }

  // --- Fetch Data Detail Ikan ---
  useEffect(() => {
    const fetchDetailIkan = async () => {
      setLoading(true);
      setError(null);
      setIkanDetail(null);
      setRelatedIkanList([]); // Reset related items juga
      try {
        const response = await apiClient.get(`/ikan/${slug}`);
        if (response.data && response.data.data) {
          setIkanDetail(response.data.data);
          setQuantity(1); // Reset kuantitas ke 1
        } else {
          setError("Data ikan tidak ditemukan atau format tidak sesuai.");
        }
      } catch (err) {
        console.error(`Gagal memuat detail ikan (slug: ${slug}):`, err);
        if (err.response && err.response.status === 404) {
          setError("Ikan yang Anda cari tidak ditemukan.");
        } else {
          setError("Gagal memuat data ikan. Silakan coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchDetailIkan();
    } else {
      setError("Slug ikan tidak ditemukan di URL.");
      setLoading(false);
    }
  }, [slug]); // Dependency hanya slug

  // --- Fetch Data Ikan Terkait ---
  useEffect(() => {
    const fetchRelatedIkan = async (categorySlug, currentIkanId) => {
      if (!categorySlug) return;
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const response = await apiClient.get(
          `/ikan?kategori_slug=${categorySlug}&limit=5`
        );
        if (response.data && Array.isArray(response.data.data)) {
          const relatedItems = response.data.data
            .filter((ikan) => ikan.id !== currentIkanId)
            .slice(0, 4);
          setRelatedIkanList(relatedItems);
        } else {
          setRelatedIkanList([]);
        }
      } catch (err) {
        console.error("Gagal memuat ikan terkait:", err);
        setRelatedError("Gagal memuat produk serupa.");
        setRelatedIkanList([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    if (ikanDetail && ikanDetail.kategori?.slug && ikanDetail.id) {
      fetchRelatedIkan(ikanDetail.kategori.slug, ikanDetail.id);
    }
  }, [ikanDetail]); // Dependency hanya ikanDetail

  // --- Handler Ubah Kuantitas ---
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  // --- Handler Tambah ke Keranjang (Menggunakan Modal) ---
  const handleAddToCart = async () => {
    // Cek ketersediaan dan status ikanDetail
    const isCurrentlyAvailable =
      ikanDetail?.status_ketersediaan?.toLowerCase() === "tersedia";
    if (!ikanDetail || !isCurrentlyAvailable || isAddingToCart) return;

    setIsAddingToCart(true);
    setAddToCartStatus(null);

    try {
      await apiClient.post("/keranjang", {
        ikan_id: ikanDetail.id,
        quantity: quantity, // Kirim 'quantity'
      });

      setAddToCartStatus("success");
      openModal(
        "success",
        "Berhasil!",
        `${quantity} ${ikanDetail.nama} berhasil ditambahkan ke keranjang!`
      );
      setTimeout(() => setAddToCartStatus(null), 2500); // Reset status tombol
    } catch (err) {
      setAddToCartStatus("error");
      const backendErrorMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let displayMessage = "Gagal menambahkan item ke keranjang.";

      if (backendErrorMessage) {
        displayMessage = backendErrorMessage;
      } else if (validationErrors) {
        // Coba ambil pesan error validasi pertama jika ada
        const firstErrorKey = Object.keys(validationErrors)[0];
        if (firstErrorKey && Array.isArray(validationErrors[firstErrorKey])) {
          displayMessage = validationErrors[firstErrorKey][0];
        }
      } else if (err.message) {
        displayMessage = err.message;
      }

      openModal("error", "Gagal", displayMessage);
      setTimeout(() => setAddToCartStatus(null), 3000); // Reset status tombol
      console.error("Gagal menambahkan ke keranjang:", err.response || err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // --- Render Kondisional (Loading, Error, Fallback) ---
  if (loading) {
    return (
      <>
        {" "}
        <DetailLoadingSkeleton />{" "}
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center justify-center text-center">
          <XCircleIcon className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Oops! Terjadi Kesalahan
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" /> Kembali
          </button>
        </main>
      </div>
    );
  }

  if (!ikanDetail) {
    return (
      // Fallback jika ikanDetail null setelah loading selesai (seharusnya jarang terjadi)
      <div className="bg-white min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center">
          <p className="text-gray-500">Detail ikan tidak dapat dimuat.</p>
        </main>
      </div>
    );
  }

  // Hitung status ketersediaan di sini setelah memastikan ikanDetail ada
  const isAvailable =
    ikanDetail.status_ketersediaan?.toLowerCase() === "tersedia";

  // --- Fungsi Konten Tombol Dinamis ---
  const getButtonContent = () => {
    if (isAddingToCart)
      return (
        <>
          <ClockIcon className="h-5 w-5 mr-2 animate-spin" /> Memproses...
        </>
      );
    if (addToCartStatus === "success")
      return (
        <>
          <CheckCircleIcon className="h-5 w-5 mr-2" /> Berhasil!
        </>
      );
    if (addToCartStatus === "error")
      return (
        <>
          <XCircleIcon className="h-5 w-5 mr-2" /> Gagal, coba lagi
        </>
      );
    return (
      <>
        <ShoppingCartIcon className="h-5 w-5 mr-2" /> Tambah ke Keranjang
      </>
    );
  };

  // --- Render JSX Utama Halaman Detail ---
  return (
    <>
      {" "}
      {/* Fragment agar modal bisa diletakkan di level yang sama */}
      <div className="bg-white min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Tombol Kembali */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" /> Kembali
            </button>

            {/* Grid Konten Detail */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">
              {/* Kolom Gambar */}
              <div className="md:col-span-2 w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <img
                  src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_600,h_600,c_fill,q_auto,f_auto/${ikanDetail.gambar_utama}`}
                  alt={ikanDetail.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Kolom Informasi & Aksi */}
              <div className="md:col-span-3 flex flex-col">
                {ikanDetail.kategori && (
                  <span className="text-sm font-medium text-blue-600 mb-2 inline-block">
                    {ikanDetail.kategori.nama}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {ikanDetail.nama}
                </h1>
                <p className="text-3xl font-bold text-blue-700 mb-5">
                  {formatRupiah(ikanDetail.harga)}
                </p>
                <div className="flex items-center space-x-4 mb-5">
                  {isAvailable ? (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-4 w-4 mr-1.5" /> Habis
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Stok: {ikanDetail.stok ?? "-"}{" "}
                    {/* Tampilkan stok jika ada, jika null tampilkan '-' */}
                  </span>
                </div>
                <div className="text-gray-700 leading-relaxed mb-8 prose prose-sm sm:prose-base max-w-none">
                  {ikanDetail.deskripsi ? (
                    <div dangerouslySetInnerHTML={{ __html: ikanDetail.deskripsi }} />
                  ) : (
                    <p>Deskripsi tidak tersedia.</p>
                  )}
                </div>

                {/* Aksi (Kuantitas & Tambah Keranjang) */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Kontrol Kuantitas */}
                    <div className="flex items-center border border-gray-300 rounded-lg w-full sm:w-auto">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1 || isAddingToCart}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Kurangi Kuantitas"
                      >
                        <MinusIcon className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        disabled={isAddingToCart || !isAvailable} // Disable jika habis juga
                        className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        aria-label="Kuantitas"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={isAddingToCart || !isAvailable} // Disable jika habis juga
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Tambah Kuantitas"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Tombol Tambah ke Keranjang */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!isAvailable || isAddingToCart}
                      className={cn(
                        "flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150",
                        isAddingToCart
                          ? "bg-yellow-500 cursor-wait"
                          : addToCartStatus === "success"
                          ? "bg-green-600"
                          : addToCartStatus === "error"
                          ? "bg-red-600"
                          : !isAvailable
                          ? "bg-gray-400 opacity-60 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {getButtonContent()}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Produk Terkait */}
            {(relatedIkanList.length > 0 || relatedLoading) && (
              <section className="mt-16 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Produk Serupa{" "}
                  {ikanDetail.kategori ? `di ${ikanDetail.kategori.nama}` : ""}
                </h2>
                {relatedError && (
                  <p className="text-red-600 mb-4">{relatedError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {relatedLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonCard key={`related-skeleton-${index}`} />
                      ))
                    : relatedIkanList.map((ikan) => (
                        <IkanCard key={`related-${ikan.id}`} ikan={ikan} />
                      ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      {/* --- Render Modal Notifikasi --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child // Backdrop
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0  bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child // Panel Konten Modal
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-semibold leading-6 flex items-center ${
                      // Judul dengan ikon
                      modalContent.type === "success"
                        ? "text-green-700"
                        : modalContent.type === "error"
                        ? "text-red-700"
                        : "text-gray-900"
                    }`}
                  >
                    {modalContent.type === "success" && (
                      <CheckCircleIcon className="h-6 w-6 mr-2 flex-shrink-0" />
                    )}
                    {modalContent.type === "error" && (
                      <XCircleIcon className="h-6 w-6 mr-2 flex-shrink-0" />
                    )}
                    {modalContent.title}
                  </Dialog.Title>
                  <div className="mt-3">
                    {" "}
                    {/* Konten Pesan */}
                    <p className="text-sm text-gray-600">
                      {modalContent.message}
                    </p>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    {" "}
                    {/* Tombol Tutup */}
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                        modalContent.type === "success"
                          ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                          : modalContent.type === "error"
                          ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                      }`}
                      onClick={closeModal}
                    >
                      Oke
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default DetailIkanPage;
