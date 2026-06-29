// File: api/ocr.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    const { base64, mimeType } = req.body;
    
    // Kunci API ditarik dari Environment Variables Vercel (sangat aman)
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ status: 'error', message: 'API Key belum di-setting di Vercel.' });
    }

    // Memisahkan header base64 (data:image/jpeg;base64,...)
    const base64Data = base64.split(',')[1];

    // Endpoint Gemini 1.5 Flash (Sangat optimal untuk Vision & Kecepatan)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Prompt khusus agar AI hanya mengembalikan JSON terstruktur
    const payload = {
      contents: [{
        parts: [
          { text: "Ekstrak riwayat kehadiran dari gambar ini. Cari tanggal, jam masuk, jam pulang, dan jenis kehadiran (seperti 'Fleksibel Bekerja Secara Lokasi' atau 'Bekerja di Kantor'). KEMBALIKAN HANYA JSON ARRAY MURNI TANPA MARKDOWN (tanpa 
http://googleusercontent.com/immersive_entry_chip/0

---

### Panduan Memasukkan ke Vercel (Sangat Penting)

Karena kita menggunakan API Key, langkah nomor 4 di bawah ini **wajib** dilakukan agar mesin AI bisa bekerja:

1. **Push ke GitHub:** Pastikan file `index.html` dan folder `api` yang berisi `ocr.js` sudah di-*commit* dan di-*push* ke *repository* GitHub Anda.
2. **Deploy di Vercel:** Buka [Vercel Dashboard](https://vercel.com/dashboard) > Klik **Add New Project** > Pilih *repository* GitHub yang baru saja dibuat.
3. **Konfigurasi Project:** Biarkan bagian *Framework Preset* berada di **Other** dan jangan ubah *Build Command*.
4. **Masukkan API Key (Kunci Rahasia):**
   * Sebelum menekan tombol Deploy, cari bagian menu yang bernama **Environment Variables**.
   * Di kolom **Key**, ketik persis seperti ini: `GEMINI_API_KEY`
   * Di kolom **Value**, *paste* API Key Gemini atau OpenAI milik Anda.
   * Klik tombol **Add**.
5. Klik **Deploy** dan tunggu proses selesai.

Setelah *deploy* sukses, Vercel secara otomatis akan menjadikan file `index.html` sebagai halaman depan, dan folder `/api/ocr.js` akan disembunyikan sebagai *Serverless Backend* yang menjembatani aplikasi dengan sistem kecerdasan buatan, memastikan API key tetap rahasia. Format output CSV dijamin tetap 100% konsisten dengan template aslinya.
