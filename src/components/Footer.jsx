import React from "react";
// 1. Import logo Pasifix Anda (sesuaikan path jika perlu)
import siteLogo from "../assets/pasifix.png";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Dinamiskan tahun copyright

  return (
    // Ganti background menjadi putih atau tetap abu-abu muda
    <section className="py-10 bg-white sm:pt-16 lg:pt-24 border-t border-gray-200">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-10 gap-x-8 xl:gap-x-12">
          {" "}
          {/* Sesuaikan grid */}
          {/* Kolom Logo & Deskripsi */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pr-8">
            {/* 3. Gunakan logo Pasifix */}
            <img
              className="w-auto h-20" // Sesuaikan ukuran jika perlu (h-10 sama seperti Navbar)
              src={siteLogo}
              alt="Pasifix Logo"
            />
            {/* 4. Ganti deskripsi */}
            <p className="text-base leading-relaxed text-gray-600 mt-6">
              Pasifix menyediakan seafood segar berkualitas langsung ke rumah
              Anda. Nikmati kemudahan memesan ikan dan hasil laut terbaik dari
              perairan Indonesia.
            </p>

            {/* 5. Sesuaikan Ikon Sosial Media */}
            <ul className="flex items-center space-x-3 mt-7">
              <li>
                <a
                  href="#" // <-- Ganti dengan URL Instagram Pasifix
                  title="Instagram Pasifix"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-blue-600 rounded-full w-8 h-8 hover:bg-blue-700 focus:bg-blue-700" // Gunakan warna biru Pasifix
                >
                  {/* Ganti dengan ikon Instagram (contoh placeholder) */}
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
                    />
                  </svg>
                  {/* Jika pakai react-icons: <FaInstagram className="w-4 h-4" /> */}
                </a>
              </li>
              <li>
                <a
                  href="#" // <-- Ganti dengan URL Facebook Pasifix
                  title="Facebook Pasifix"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-blue-600 rounded-full w-8 h-8 hover:bg-blue-700 focus:bg-blue-700"
                >
                  {/* Ganti dengan ikon Facebook (contoh placeholder) */}
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                  </svg>
                  {/* Jika pakai react-icons: <FaFacebookF className="w-4 h-4" /> */}
                </a>
              </li>
              <li>
                <a
                  href="#" // <-- Ganti dengan URL WhatsApp Pasifix / nomor
                  title="WhatsApp Pasifix"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-blue-600 rounded-full w-8 h-8 hover:bg-blue-700 focus:bg-blue-700"
                >
                  {/* Ganti dengan ikon WhatsApp (contoh placeholder) */}
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.1-.3.2-.5.1-.3-.1-1-.4-1.9-.9-.7-.7-1.2-1.5-1.3-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.2.3-.3.1-.1.1-.2.1-.3s0-.4-.1-.5L8 7.8C7.8 7.3 7.6 7 7.4 7c-.1 0-.3.1-.5.1h-.5c-.2 0-.5.2-.6.7-.1.5-.7 2.2.2 4.1.8 1.6 2.1 3.1 3.7 4.1 1.9 1 2.8.9 3.7.8.4 0 1.3-.6 1.5-1.1.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path>
                  </svg>
                  {/* Jika pakai react-icons: <FaWhatsapp className="w-4 h-4" /> */}
                </a>
              </li>
              {/* Hapus/tambah ikon lain sesuai kebutuhan */}
            </ul>
          </div>
          {/* Kolom Tautan Perusahaan */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            {" "}
            {/* Sesuaikan span */}
            <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              Perusahaan
            </p>
            {/* 6. Ganti Tautan */}
            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Tentang Kami{" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Cara Pesan{" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Katalog Produk{" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Hubungi Kami{" "}
                </a>
              </li>
            </ul>
          </div>
          {/* Kolom Tautan Bantuan */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            {" "}
            {/* Sesuaikan span */}
            <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              Bantuan
            </p>
            {/* 6. Ganti Tautan */}
            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Tanya Jawab (FAQ){" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Syarat & Ketentuan{" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Kebijakan Privasi{" "}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  title=""
                  className="flex text-base text-gray-700 transition-all duration-200 hover:text-blue-600 focus:text-blue-600"
                >
                  {" "}
                  Lacak Pengiriman{" "}
                </a>
              </li>
            </ul>
          </div>
          {/* Kolom Newsletter */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pl-4 xl:pl-8">
            {" "}
            {/* Sesuaikan span */}
            <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              Langganan Info & Promo
            </p>
            {/* 7. Sesuaikan Form Newsletter */}
            <form action="#" method="POST" className="mt-6">
              <div>
                <label htmlFor="footer-email" className="sr-only">
                  {" "}
                  Email{" "}
                </label>
                <input
                  type="email"
                  name="footer-email"
                  id="footer-email"
                  placeholder="Masukkan alamat email Anda"
                  className="block w-full p-4 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent caret-blue-600" // Ganti warna input
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center w-full px-6 py-4 mt-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700" // Gunakan warna biru Pasifix
              >
                Berlangganan
              </button>
            </form>
          </div>
        </div>

        <hr className="mt-16 mb-10 border-gray-200" />

        {/* 8. Ganti Copyright */}
        <p className="text-sm text-center text-gray-600">
          © Copyright {currentYear}, Pasifix. All Rights Reserved.
        </p>
      </div>
    </section>
  );
};

export default Footer;
