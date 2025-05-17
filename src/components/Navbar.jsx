import React, { useState, useEffect, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

import apiClient from "../api/apiClient"; // Tetap perlu untuk Logout
import siteLogo from "../assets/icon-pasifix.png"; // Sesuaikan path

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  // isLoading tidak diperlukan lagi karena kita baca dari localStorage secara sync
  // const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Efek untuk membaca status login dari localStorage saat komponen mount/refresh
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Jika token ada, anggap user login. Coba ambil data dari localStorage
      const storedUser = localStorage.getItem("authUser");
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        // Set state dengan data dari localStorage atau default jika tidak ada/invalid
        setUser({
          // Sediakan nilai default jika properti tidak ada di parsedUser
          name: parsedUser?.name || "Pengguna",
          email: parsedUser?.email || "",
          profile_photo_url: parsedUser?.profile_photo_url || null,
          // Anda bisa tambahkan properti lain dari localStorage jika ada
        });
      } catch (e) {
        console.error("Gagal parse authUser dari localStorage:", e);
        // Jika gagal parse, set user ke default logged-in state
        setUser({ name: "Pengguna", email: "", profile_photo_url: null });
      }
    } else {
      // Jika tidak ada token, user null (belum login)
      setUser(null);
    }
    // Tidak perlu setIsLoading(false)
  }, []); // Hanya jalan sekali saat mount

  // Fungsi handleLogout (Panggil API Dulu)
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post("/logout"); // Coba logout dari backend dulu
      console.log("Logout API call successful (token invalidated on backend).");
    } catch (error) {
      console.error(
        "Logout API call failed, proceeding with local logout:",
        error.response || error
      );
      // Tidak perlu alert karena interceptor mungkin sudah handle/redirect
      // atau karena logout lokal tetap akan dilakukan
    } finally {
      // Selalu bersihkan local storage & state, lalu redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setUser(null);
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
      console.log("Local storage cleared, navigating to login.");
      navigate("/login");
    }
  };

  // Styling classes (tetap sama)
  const getNavLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-blue-100 hover:bg-blue-700 hover:text-white"
    }`;
  const getMobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-blue-100 hover:bg-blue-700 hover:text-white"
    }`;

  // Error handler gambar (tetap sama)
  const handleNavbarImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    console.warn("Gagal memuat foto profil Navbar:", e.target.src);
  };

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side */}
          <div className="flex items-center">
            <div className="flex items-center md:hidden mr-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Buka menu</span>{" "}
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center space-x-2">
                <img
                  className="h-10 w-auto"
                  src={siteLogo}
                  alt="Pasifix Logo"
                />
                <span className="text-white font-bold text-xl hidden sm:inline">
                  Pasifix
                </span>
              </NavLink>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex md:justify-center md:flex-1 md:mx-6">
            <div className="flex items-baseline space-x-4">
              <NavLink to="/dashboard" className={getNavLinkClass}>
                <HomeIcon className="h-5 w-5 mr-1" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/katalog" className={getNavLinkClass}>
                <BuildingStorefrontIcon className="h-5 w-5 mr-1" />
                <span>Katalog</span>
              </NavLink>
              <NavLink to="/keranjang" className={getNavLinkClass}>
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                <span>Keranjang</span>
              </NavLink>
              <NavLink to="/PesananPage" className={getNavLinkClass}>
                <ArchiveBoxIcon className="h-5 w-5 mr-1" />
                <span>Pesanan</span>
              </NavLink>
            </div>
          </div>

          {/* Right Side (Cek 'user' langsung, tanpa 'isLoading') */}
          <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
            {user ? ( // Jika ada user di state (dari localStorage)
              <>
                <NavLink
                  to="/profile"
                  className="flex items-center p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                  title={user.name || "Profile"}
                >
                  <span className="sr-only">Profile</span>
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name || "User profile"}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={handleNavbarImageError}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
                  )}
                </NavLink>
                <button
                  onClick={handleLogout}
                  type="button"
                  disabled={isLoggingOut}
                  className={`p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white transition-opacity ${
                    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  <ArrowRightOnRectangleIcon
                    className="h-7 w-7"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              // Jika user null (tidak ada token)
              <NavLink to="/login" className={getNavLinkClass}>
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span>Login</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isMobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div
          className="md:hidden absolute w-full bg-blue-600 shadow-md z-40"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              key="/"
              to="/"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              <span>Home</span>
            </NavLink>
            <NavLink
              key="/katalog"
              to="/katalog"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
              <span>Katalog</span>
            </NavLink>
            <NavLink
              key="/keranjang"
              to="/keranjang"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              <span>Keranjang</span>
            </NavLink>
            <NavLink
              key="/orders"
              to="/orders"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              <span>Pesanan</span>
            </NavLink>
          </div>
          {/* Mobile User/Login Section (Tanpa isLoading) */}
          <div className="pt-4 pb-3 border-t border-blue-700">
            {user ? (
              <div className="flex items-center px-5">
                <NavLink
                  to="/profile"
                  className="flex-shrink-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name || "User profile"}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={handleNavbarImageError}
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-10 w-10 rounded-full text-blue-200"
                      aria-hidden="true"
                    />
                  )}
                </NavLink>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-base font-medium text-white truncate">
                    {user.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-blue-200 truncate">
                    {user.email || ""}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  type="button"
                  disabled={isLoggingOut}
                  className={`ml-auto flex-shrink-0 p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white ${
                    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <div className="px-2 sm:px-3">
                <NavLink
                  to="/login"
                  className={getMobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Login</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;
