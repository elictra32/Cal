/**
 * Nutri Journal — Gemini proxy (Vercel Serverless Function)
 *
 * Keeps the Gemini API key on the server so it never appears in index.html.
 * Set the key once in Vercel → Project → Settings → Environment Variables:
 *   GEMINI_API_KEY = <your key from aistudio.google.com>
 *
 * The page calls POST /api/gemini?model=<model> with a generateContent body.
 */
const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3-pro-preview',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
]);
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const fail = (res, status, message) => res.status(status).json({ error: { message } });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail(res, 500, 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GEMINI_API_KEY');

  // Only serve requests coming from this site's own pages.
  const origin = req.headers.origin;
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch { /* malformed origin */ }
    if (originHost !== req.headers.host) return fail(res, 403, 'Forbidden origin');
  }

  const model = String(req.query.model || 'gemini-3.8-flash');
  // 404 + "not supported" lets the page fall back to the next model in its list.
  if (!ALLOWED_MODELS.has(model)) return fail(res, 404, `Model ${model} is not supported by this server`);

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (Buffer.byteLength(body) > MAX_BODY_BYTES) return fail(res, 413, 'รูปใหญ่เกินไป');

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body },
    );
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (err) {
    return fail(res, 502, 'เชื่อมต่อ Gemini ไม่สำเร็จ: ' + (err && err.message ? err.message : err));
  }
};
