// src/pages/LoginPage.jsx
import React, { useState, useEffect, Fragment } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
// Pastikan path background image ini benar
import backgroundImage from "../assets/bg-login.jpg";
import Icon from "../assets/icon-pasifix.png";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [agree, setAgree] = useState(false); // State agree dari kode Anda
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeModalAndNavigate = () => {
    setIsSuccessModalOpen(false);
    navigate("/dashboard");
  };

  // --- handleSubmit dengan logika penyimpanan token ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi tambahan jika perlu (misal: agree)
    // if (!agree) {
    //     setError("Anda harus menyetujui syarat untuk login."); // Contoh jika 'agree' diperlukan
    //     return;
    // }

    setLoading(true);

    try {
      const response = await apiClient.post("/login", {
        email: email,
        password: password,
      });

      console.log("Login successful response:", response.data); // Log response

      // --- Ambil dan Simpan Token ---
      const token = response.data.token;
      const user = response.data.user; // Opsional

      if (token) {
        // Simpan token ke localStorage
        localStorage.setItem("authToken", token); // Gunakan key 'authToken'
        console.log("Token saved to localStorage:", token);

        // (Opsional) Simpan data user
        if (user) {
          localStorage.setItem("authUser", JSON.stringify(user));
        }

        // Lanjutkan: Tampilkan modal sukses
        setIsSuccessModalOpen(true);
      } else {
        // Handle jika token tidak ada di response
        console.error("Token not found in login response!");
        setError("Login berhasil, namun data autentikasi tidak diterima.");
      }
      // Navigasi dipindah ke closeModalAndNavigate
    } catch (err) {
      console.error("Login error:", err.response || err.message);
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa kembali email dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };
  // --- Akhir handleSubmit ---

  return (
    // Latar belakang dari kode Anda: bg-gray-50
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
      {/* Kontainer utama dengan animasi */}
      <div
        className={`w-full max-w-4xl flex rounded-xl shadow-xl overflow-hidden transition-all duration-700 ease-out transform ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Left side */}
        <div
          className="w-1/2 p-12 flex-col items-start justify-center text-white hidden sm:flex"
          style={{
            backgroundImage: `url(${backgroundImage})`, // Background image dari kode Anda
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "50vh",
          }}
        >
          <img src={Icon} alt="Icon" className="w-32 h-auto mb-8 " />
          <h1 className="text-5xl font-bold mb-4 text-left">Halo Pacifix!!</h1>
          <p className="text-lg mb-8 text-left">
            Berbelanja Ikan Segar Jadi Mudah dengan Kami: Pilihan Terbaik, Harga
            Bersaing, dan Pengiriman Tepat Waktu ke Rumah Anda.
          </p>
        </div>

        {/* Right side (Login form) */}
        <div className="w-full sm:w-1/2 bg-white p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Masuk ke Akun Anda
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat email Anda"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Kata Sandi
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kata sandi Anda"
              />
            </div>

            {/* Checkbox 'agree' dari kode Anda */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree" className="text-sm text-gray-600">
                Saya setuju dengan{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Syarat dan Ketentuan
                </a>{" "}
                serta{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Kebijakan Privasi
                </a>
                .
              </label>
            </div>

            {/* Tombol dengan disabled berdasarkan agree dari kode Anda */}
            <button
              type="submit"
              disabled={loading || !agree}
              className={`w-full py-3 text-white font-semibold rounded-lg transition duration-300 ${
                loading || !agree
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {loading ? "Sedang memproses..." : "Masuk"}
            </button>

            <p className="text-center text-gray-500 text-sm">
              <span>Belum punya akun? </span>
              <a
                href="/register"
                className="text-blue-600 hover:underline font-semibold"
              >
                Daftar di sini
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* === Modal Sukses Login === */}
      <Transition appear show={isSuccessModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50" // Pastikan z-index tinggi
          onClose={closeModalAndNavigate}
        >
          {/* Overlay dengan backdrop blur */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/20" // Sedikit bg hitam transparan untuk kontras blur
              aria-hidden="true"
            />
          </Transition.Child>

          {/* Konten Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
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
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    Login Berhasil!
                  </Dialog.Title>
                  <div className="mt-4 flex flex-col items-center">
                    <CheckCircleIcon
                      className="h-16 w-16 text-green-500 mb-4"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Selamat datang kembali! Anda akan diarahkan ke halaman
                      dashboard.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModalAndNavigate}
                    >
                      OK
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* === Akhir Modal Sukses Login === */}
    </div>
  );
}

export default LoginPage;
