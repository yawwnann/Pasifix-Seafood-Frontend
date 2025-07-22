import React, { useState, useEffect } from "react";
import axios from "axios";

function IkanList() {
  const [ikanData, setIkanData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = "http://localhost:9000/api/ikan?page=3";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(apiUrl);
        console.log("Full API Response:", response); // Untuk debug

        // --- PENYESUAIAN 1: Ambil array dari response.data.data ---
        // Cek dulu apakah response.data dan response.data.data ada
        const dataFromApi = response.data?.data;
        console.log("Extracted Data Array:", dataFromApi); // Untuk debug

        // Set state dengan data yang diekstrak atau array kosong jika tidak ada
        setIkanData(Array.isArray(dataFromApi) ? dataFromApi : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Render Logic ---

  if (isLoading) {
    return <p>Memuat data ikan...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Gagal memuat data: {error.message}</p>;
  }

  return (
    <div>
      <h1>Daftar Ikan</h1>
      {/* Cek panjang array ikanData */}
      {ikanData.length > 0 ? (
        <ul>
          {/* Map melalui array ikanData */}
          {ikanData.map((ikan) => (
            // --- PENYESUAIAN 2: Gunakan properti yang benar ---
            // Gunakan ikan.id sebagai key (sudah benar karena ada di data)
            <li key={ikan.id}>
              {/* Tampilkan nama ikan */}
              Nama: {ikan.nama ?? "N/A"},
              {/* Tampilkan nama kategori (akses ikan.kategori.nama) */}
              {/* Gunakan optional chaining (?.) untuk keamanan jika kategori null/undefined */}
              Kategori: {ikan.kategori?.nama ?? "N/A"}
              {/* Anda bisa tambahkan data lain dari API di sini, contoh: */}
              {/* , Harga: {ikan.harga ?? 'N/A'} */}
              {/* , Stok: {ikan.stok ?? 0} */}
              {/* , Deskripsi: {ikan.deskripsi ?? ''} */}
            </li>
          ))}
        </ul>
      ) : (
        // Tampilkan pesan jika ikanData kosong setelah fetch
        <p>Tidak ada data ikan ditemukan.</p>
      )}
    </div>
  );
}

export default IkanList;
