// File: src/components/PaymentProofUploadForm.jsx (Contoh path)
import React, { useState } from "react";
import apiClient from "../api/apiClient"; // Sesuaikan path ke apiClient Anda
import { ArrowPathIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

function PaymentProofUploadForm({ orderId, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleSubmitProof = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Silakan pilih file bukti pembayaran.");
      return;
    }
    setIsUploading(true);
    setMessage("");
    setError("");
    const formData = new FormData();
    formData.append("payment_proof", selectedFile);
    try {
      const response = await apiClient.post(
        `/pesanan/${orderId}/submit-payment-proof`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(response.data.message || "Bukti pembayaran berhasil dikirim!");
      setSelectedFile(null);
      if (event.target && typeof event.target.reset === "function")
        event.target.reset();
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Terjadi kesalahan.";
      if (err.response?.data?.errors?.payment_proof) {
        setError(err.response.data.errors.payment_proof.join(", "));
      } else {
        setError(errorMessage);
      }
      if (onUploadError) onUploadError(errorMessage);
      console.error(
        "Error submitting payment proof:",
        err.response?.data || err.message
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmitProof}
      className="mt-6 bg-gray-50 p-6 rounded-lg shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <CloudArrowUpIcon className="h-6 w-6 mr-2 text-indigo-600" />
        Unggah Bukti Pembayaran
      </h3>
      <p className="text-sm text-gray-600 mb-1">
        Untuk Pesanan ID:{" "}
        <strong className="font-medium text-gray-900">{orderId}</strong>
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Format yang diterima: JPG, PNG, GIF (Maks 2MB).
      </p>
      <div>
        <label
          htmlFor={`paymentProofFile-${orderId}`}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Pilih File:
        </label>
        <input
          type="file"
          id={`paymentProofFile-${orderId}`}
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isUploading}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      <button
        type="submit"
        disabled={isUploading || !selectedFile}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 transition-opacity"
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> Mengirim
            Bukti...
          </div>
        ) : (
          "Kirim Bukti Pembayaran"
        )}
      </button>
    </form>
  );
}

export default PaymentProofUploadForm;
