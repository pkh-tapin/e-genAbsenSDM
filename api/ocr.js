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

    // PERBAIKAN: Menggunakan endpoint Gemini 1.5 Flash yang benar
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Prompt khusus agar AI hanya mengembalikan JSON terstruktur
    const payload = {
      contents: [{
        parts: [
          { text: "Ekstrak riwayat kehadiran dari gambar ini. Cari tanggal, jam masuk, jam pulang, dan jenis kehadiran (seperti 'Fleksibel Bekerja Secara Lokasi' atau 'Bekerja di Kantor'). KEMBALIKAN HANYA JSON ARRAY MURNI TANPA MARKDOWN" },
          { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ status: 'error', message: 'API Error', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json({ status: 'success', data: data });

  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal Server Error', error: error.message });
  }
}
