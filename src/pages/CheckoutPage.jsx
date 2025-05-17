// File: src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PencilIcon,
  CreditCardIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckoutPageSkeleton } from "../components/CheckoutSkeletons"; // Contoh jika helper & skeleton di file terpisah
import { formatRupiah } from "../components/formatRupiah";
function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [checkoutError, setCheckoutError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    namaPemesan: "",
    nomorHp: "",
    alamatPengiriman: "",
    catatan: "",
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCartAndUser = async () => {
      setLoadingCart(true);
      setCheckoutError(null);
      setCurrentUser(null);
      setCartItems([]);
      try {
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
          if (isMounted)
            console.warn("Gagal memuat data user:", userErr.message);
        }
        const cartResponse = await apiClient.get("/keranjang");
        if (isMounted) {
          if (cartResponse.data && Array.isArray(cartResponse.data.data)) {
            setCartItems(cartResponse.data.data);
          } else {
            setCartItems([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat data checkout:", err);
          if (err.response && err.response.status === 401) {
            setCheckoutError("Sesi Anda berakhir. Silakan login kembali.");
          } else {
            setCheckoutError(
              "Gagal memuat data keranjang. Muat ulang halaman."
            );
          }
          setCartItems([]);
        }
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };
    fetchCartAndUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateItemSubtotal = (item) =>
    (item.ikan?.harga || 0) * (item.quantity || 0);
  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + calculateItemSubtotal(item), 0);

  const handleCreateOrder = async (e) => {
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
    setIsProcessingOrder(true);
    setCheckoutError(null);
    const orderPayload = {
      user_id: currentUser?.id || null,
      nama_pelanggan: formData.namaPemesan,
      nomor_whatsapp: formData.nomorHp,
      alamat_pengiriman: formData.alamatPengiriman,
      catatan: formData.catatan,
      items: cartItems.map((item) => ({
        ikan_id: item.ikan.id,
        jumlah: item.quantity,
        harga_saat_pesan: item.ikan.harga,
      })),
      total_harga: calculateTotal(),
    };
    try {
      const response = await apiClient.post("/pesanan", orderPayload);
      if (response.data && response.data.data && response.data.data.id) {
        const createdOrderData = response.data.data;
        setCartItems([]);
        navigate(`/payment/${createdOrderData.id}`, {
          state: { order: createdOrderData },
        });
      } else {
        throw new Error("Respons pembuatan pesanan tidak valid.");
      }
    } catch (error) {
      console.error(
        "Gagal membuat pesanan:",
        error.response?.data || error.message
      );
      const serverErrorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat membuat pesanan.";
      const validationErrors = error.response?.data?.errors;
      let displayError = serverErrorMessage;
      if (validationErrors) {
        displayError +=
          "\n\nDetail:\n" + Object.values(validationErrors).flat().join("\n");
      }
      setCheckoutError(displayError);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {loadingCart ? (
          <CheckoutPageSkeleton />
        ) : checkoutError ? (
          <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg shadow">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 mb-4 whitespace-pre-line">
              {checkoutError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : cartItems.length === 0 ? (
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
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Lihat Katalog
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 sm:mb-10 text-center">
              Checkout
            </h1>
            <form
              onSubmit={handleCreateOrder}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12"
            >
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                  Detail Pengiriman
                </h2>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="namaPemesan"
                      className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />{" "}
                      Nama Penerima <span className="text-red-500 ml-1">*</span>
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
                  <div>
                    <label
                      htmlFor="nomorHp"
                      className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <PhoneIcon className="h-5 w-5 mr-1.5 text-gray-400" />{" "}
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
                  <div>
                    <label
                      htmlFor="alamatPengiriman"
                      className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <MapPinIcon className="h-5 w-5 mr-1.5 text-gray-400" />{" "}
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
                      {" "}
                      Detail: Jalan, No Rumah, RT/RW, Kel/Desa, Kec, Kab/Kota,
                      Prov, Kode Pos.{" "}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="catatan"
                      className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <PencilIcon className="h-5 w-5 mr-1.5 text-gray-400" />{" "}
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
              <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg h-fit">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                  {" "}
                  Ringkasan Pesanan{" "}
                </h2>
                <div className="max-h-72 overflow-y-auto mb-5 pr-2 space-y-3">
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
                            {" "}
                            {item.ikan?.nama_ikan || "Item"}{" "}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {" "}
                            {item.quantity} x{" "}
                            {formatRupiah(item.ikan?.harga || 0)}{" "}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 flex-shrink-0 ml-2 mt-0.5">
                        {" "}
                        {formatRupiah(calculateItemSubtotal(item))}{" "}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {" "}
                      {formatRupiah(calculateTotal())}{" "}
                    </p>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-base pt-2">
                    <p className="text-gray-900">Total</p>
                    <p className="text-indigo-600">
                      {" "}
                      {formatRupiah(calculateTotal())}{" "}
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessingOrder || cartItems.length === 0}
                  className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isProcessingOrder ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />{" "}
                      Memproses Pesanan...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5 mr-2" /> Buat Pesanan &
                      Pilih Metode Bayar
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
export default CheckoutPage;
