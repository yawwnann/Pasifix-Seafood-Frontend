import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path ke apiClient Anda
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PencilIcon,
  CreditCardIcon,
  ArrowPathIcon, // Tetap ada untuk tombol proses checkout
  XCircleIcon,
} from "@heroicons/react/24/outline"; // Atau solid jika preferensi lain
// Import Dialog/Transition jika diperlukan untuk modal
// import { Dialog, Transition } from '@headlessui/react';
// import { cn } from "../lib/utils"; // Impor jika digunakan

// --- Helper Function: Format Rupiah ---
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// --- Komponen Skeleton ---

// Skeleton untuk satu baris input form
const FormInputSkeleton = () => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div> {/* Label */}
    <div className="h-9 bg-gray-200 rounded w-full"></div> {/* Input */}
  </div>
);

// Skeleton untuk satu baris textarea form
const FormTextareaSkeleton = (
  { taller = false } // Tambah prop taller
) => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div> {/* Label */}
    <div
      className={` ${taller ? "h-24" : "h-20"} bg-gray-200 rounded w-full`}
    ></div>{" "}
    {/* Textarea */}
    {taller && <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>}{" "}
    {/* Helper text (jika textarea alamat) */}
  </div>
);

// Skeleton untuk satu item di ringkasan keranjang
const CartItemSkeleton = () => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0 animate-pulse">
    <div className="flex items-center flex-grow mr-3">
      <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex-shrink-0"></div>{" "}
      {/* Gambar */}
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div> {/* Nama */}
        <div className="h-3 bg-gray-200 rounded w-1/4"></div> {/* Qty */}
      </div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-1/6 flex-shrink-0"></div>{" "}
    {/* Harga */}
  </div>
);

// Skeleton untuk seluruh halaman checkout
const CheckoutPageSkeleton = () => (
  <div className="container mx-auto px-4">
    {/* Judul Halaman Skeleton */}
    <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Form Skeleton */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md animate-pulse">
        {/* Judul Form Skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 border-b border-gray-200 pb-4"></div>
        <FormInputSkeleton /> {/* Nama */}
        <FormInputSkeleton /> {/* HP */}
        <FormTextareaSkeleton taller={true} /> {/* Alamat */}
        <FormTextareaSkeleton /> {/* Catatan */}
      </div>

      {/* Kolom Ringkasan Skeleton */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit animate-pulse">
        {/* Judul Ringkasan Skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6 border-b border-gray-200 pb-4"></div>
        {/* Item Skeleton */}
        <CartItemSkeleton />
        <CartItemSkeleton />
        <CartItemSkeleton />
        {/* Total Skeleton */}
        <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-1/3 font-bold"></div>
            <div className="h-6 bg-gray-300 rounded w-2/5 font-bold"></div>
          </div>
        </div>
        {/* Tombol Skeleton */}
        <div className="h-12 bg-gray-300 rounded-lg mt-8 w-full"></div>
      </div>
    </div>
  </div>
);

// --- Komponen Utama ---
function CheckoutPage() {
  const navigate = useNavigate();

  // State
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true); // Default true untuk memuat saat mount
  const [cartError, setCartError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    namaPemesan: "",
    nomorHp: "",
    alamatPengiriman: "",
    catatan: "",
  });
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Fetch data keranjang dan user
  useEffect(() => {
    let isMounted = true; // Flag untuk mencegah update state jika komponen unmount
    const fetchCartAndUser = async () => {
      // Reset state sebelum fetch baru
      setLoadingCart(true);
      setCartError(null);
      setCurrentUser(null);
      setCartItems([]); // Kosongkan cart items juga

      try {
        // Ambil data user (coba dulu, mungkin belum login)
        let userData = null;
        try {
          const userResponse = await apiClient.get("/user");
          if (isMounted && userResponse.data) {
            userData = userResponse.data;
            setCurrentUser(userData);
            setFormData((prev) => ({
              ...prev,
              namaPemesan: userData.name || "",
              nomorHp: userData.phone || userData.nomor_whatsapp || "",
            }));
          }
        } catch (userErr) {
          if (isMounted) {
            console.warn(
              "Gagal memuat data user (mungkin belum login):",
              userErr
            );
          }
        }

        // Ambil data keranjang
        const cartResponse = await apiClient.get("/keranjang");
        if (isMounted) {
          if (cartResponse.data && Array.isArray(cartResponse.data.data)) {
            setCartItems(cartResponse.data.data);
            // Jika keranjang kosong setelah fetch, tampilkan pesan
            if (cartResponse.data.data.length === 0) {
              console.log("Keranjang kosong.");
              // Tidak perlu set error jika hanya kosong
            }
          } else {
            setCartItems([]); // Tetap array kosong jika format tidak sesuai
            console.warn(
              "Format data keranjang tidak sesuai:",
              cartResponse.data
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat data checkout:", err);
          if (err.response && err.response.status === 401) {
            setCartError("Anda harus login untuk melanjutkan checkout.");
            // Pertimbangkan redirect: navigate('/login', { replace: true });
          } else {
            setCartError("Gagal memuat data checkout. Silakan coba lagi.");
          }
          setCartItems([]); // Pastikan cart kosong jika ada error
        }
      } finally {
        if (isMounted) {
          setLoadingCart(false);
        }
      }
    };

    fetchCartAndUser();

    // Cleanup function untuk mencegah update state pada unmounted component
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array kosong

  // Handler input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Kalkulasi subtotal item
  const calculateItemSubtotal = (item) => {
    return (item.ikan?.harga || 0) * (item.quantity || 0);
  };

  // Kalkulasi total keranjang
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0
    );
  };

  // Handler tombol pembayaran
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Keranjang Anda kosong.");
      return;
    }
    if (
      !formData.namaPemesan.trim() ||
      !formData.nomorHp.trim() ||
      !formData.alamatPengiriman.trim()
    ) {
      alert("Harap lengkapi Nama Penerima, Nomor HP, dan Alamat Pengiriman.");
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const payloadForToken = {
        /* ... data payload seperti sebelumnya ... */
        customer_details: {
          first_name: formData.namaPemesan.split(" ")[0] || "",
          last_name:
            formData.namaPemesan.split(" ").slice(1).join(" ") ||
            formData.namaPemesan.split(" ")[0] ||
            "",
          email: currentUser?.email || `${formData.nomorHp}@example.com`, // Fallback email wajib
          phone: formData.nomorHp,
          billing_address: { address: formData.alamatPengiriman },
          shipping_address: {
            address: formData.alamatPengiriman,
            first_name: formData.namaPemesan.split(" ")[0] || "",
            last_name:
              formData.namaPemesan.split(" ").slice(1).join(" ") ||
              formData.namaPemesan.split(" ")[0] ||
              "",
            phone: formData.nomorHp,
          },
        },
        item_details: cartItems.map((item) => ({
          id: String(item.ikan.id),
          price: parseInt(item.ikan.harga, 10),
          quantity: parseInt(item.quantity, 10),
          name: (item.ikan?.nama_ikan || "Produk").substring(0, 50),
        })),
        transaction_details: {
          order_id: `IKAN-${currentUser?.id || "GUEST"}-${Date.now()}`, // GANTI DENGAN GENERATE ID DARI BACKEND
          gross_amount: parseInt(calculateTotal(), 10),
        },
        alamat_pengiriman: formData.alamatPengiriman,
        nomor_whatsapp: formData.nomorHp,
        catatan: formData.catatan,
      };
      console.log(
        "Data Payload untuk Request Token Midtrans:",
        payloadForToken
      );

      // --- TODO: Integrasi Midtrans ---
      // 1. Panggil API backend '/api/payment/token' dengan payloadForToken
      // 2. Dapatkan snapToken dari respons backend
      // 3. Panggil window.snap.pay(snapToken, { ...callbacks... })

      // Placeholder sementara
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulasi loading
      alert("Proses ke Midtrans belum diimplementasikan. Cek console log.");
    } catch (error) {
      console.error(
        "Gagal memproses checkout:",
        error.response?.data || error.message
      );
      alert(
        `Gagal memproses checkout: ${
          error.response?.data?.message || error.message || "Terjadi kesalahan."
        }`
      );
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // --- Render JSX ---
  return (
    <>
      {/* Background halaman lebih terang */}
      <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
        {/* Padding kontainer responsif */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Kondisi Loading -> Skeleton */}
          {loadingCart ? (
            <CheckoutPageSkeleton />
          ) : // Kondisi Error
          cartError ? (
            <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg shadow">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-red-600 mb-4">{cartError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {" "}
                Coba Lagi{" "}
              </button>
            </div>
          ) : // Kondisi Keranjang Kosong
          cartItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-5" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Keranjang Anda kosong.
              </p>
              <p className="text-gray-500 mb-6">
                Tambahkan ikan ke keranjang untuk melanjutkan.
              </p>
              <button
                onClick={() => navigate("/katalog")}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {" "}
                Lihat Katalog{" "}
              </button>
            </div>
          ) : (
            // Tampilan Utama Checkout
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 sm:mb-10 text-center">
                Checkout
              </h1>
              <form
                onSubmit={handleProceedToPayment}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12"
              >
                {/* Kolom Form */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                    Detail Pengiriman
                  </h2>
                  {/* Grup Input */}
                  <div className="space-y-5">
                    {/* Input Nama */}
                    <div>
                      <label
                        htmlFor="namaPemesan"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Nama Penerima{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="namaPemesan"
                        id="namaPemesan"
                        value={formData.namaPemesan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                    {/* Input Nomor HP */}
                    <div>
                      <label
                        htmlFor="nomorHp"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <PhoneIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Nomor HP (WhatsApp){" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomorHp"
                        id="nomorHp"
                        value={formData.nomorHp}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                    {/* Input Alamat */}
                    <div>
                      <label
                        htmlFor="alamatPengiriman"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <MapPinIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Alamat Pengiriman Lengkap{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        name="alamatPengiriman"
                        id="alamatPengiriman"
                        rows="4"
                        value={formData.alamatPengiriman}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      ></textarea>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Detail: Jalan, No Rumah, RT/RW, Kel/Desa, Kec, Kab/Kota,
                        Prov, Kode Pos.
                      </p>
                    </div>
                    {/* Input Catatan */}
                    <div>
                      <label
                        htmlFor="catatan"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <PencilIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Catatan (Opsional)
                      </label>
                      <textarea
                        name="catatan"
                        id="catatan"
                        rows="3"
                        value={formData.catatan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Kolom Ringkasan */}
                <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg h-fit">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                    Ringkasan Pesanan
                  </h2>
                  {/* Daftar Item */}
                  <div className="max-h-72 overflow-y-auto mb-5 pr-2 space-y-3">
                    {" "}
                    {/* Scroll & space */}
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start py-2"
                      >
                        <div className="flex items-start flex-grow mr-3">
                          <img
                            src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_64,h_64,c_fill,q_auto,f_auto/${item.ikan?.gambar_utama}`}
                            alt={item.ikan?.nama_ikan}
                            className="w-16 h-16 object-cover rounded-md mr-3 flex-shrink-0 shadow-sm"
                          />
                          <div className="flex-grow mt-0.5">
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {item.ikan?.nama_ikan || "Item"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} x{" "}
                              {formatRupiah(item.ikan?.harga || 0)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 flex-shrink-0 ml-2 mt-0.5">
                          {formatRupiah(calculateItemSubtotal(item))}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div className="pt-5 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatRupiah(calculateTotal())}
                      </p>
                    </div>
                    {/* <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Ongkos Kirim</p>
                          <p className="text-sm font-medium text-gray-900">{formatRupiah(0)}</p> // Contoh
                      </div> */}
                    <div className="flex justify-between items-center font-semibold text-base pt-2">
                      <p className="text-gray-900">Total</p>
                      <p className="text-indigo-600">
                        {formatRupiah(calculateTotal())}
                      </p>
                    </div>
                  </div>
                  {/* Tombol Pembayaran */}
                  <button
                    type="submit"
                    disabled={isProcessingCheckout || cartItems.length === 0}
                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isProcessingCheckout ? (
                      <>
                        {" "}
                        <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />{" "}
                        Memproses...{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <CreditCardIcon className="h-5 w-5 mr-2" /> Lanjutkan
                        Pembayaran{" "}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      {/* Modal (jika perlu) */}
    </>
  );
}
export default CheckoutPage;
