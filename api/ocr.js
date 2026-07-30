export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    const { base64, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'API Key belum di-setting di Environment Variables Vercel (GEMINI_API_KEY).' 
      });
    }

    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    // Daftar model yang dicoba berurutan (Gemini 2.5 Flash -> Fallback ke 1.5 Flash)
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let responseData = null;
    let lastError = '';

    for (const model of models) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [
            { text: `Ekstrak data kehadiran dari gambar ini.
Tugas:
1. Tanggal format DD-MM-YYYY (contoh: 30/07/2026 jadi 30-07-2026).
2. Jam Masuk dan Jam Pulang format HH:MM. Jika tidak ada/strip, isi "-".
3. Keterangan isi "Hadir".
Kembalikan HANYA JSON Array murni tanpa markdown.
Format: [{"tanggal": "DD-MM-YYYY", "masuk": "HH:MM", "pulang": "HH:MM", "keterangan": "Hadir"}]` },
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Data } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      };

      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (apiRes.ok) {
        responseData = await apiRes.json();
        break; // Berhasil, keluar dari loop
      } else {
        lastError = await apiRes.text();
      }
    }

    if (!responseData) {
      throw new Error(`Google API Error: ${lastError}`);
    }

    const rawText = responseData.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return res.status(200).json({ status: 'success', data: parsedData });

  } catch (error) {
    console.error("OCR Error:", error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
