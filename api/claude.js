/**
 * Nutri Journal — Claude proxy (Vercel Serverless Function)
 *
 * Keeps the Anthropic API key on the server so it never appears in index.html.
 * Set the key once in Vercel → Project → Settings → Environment Variables:
 *   ANTHROPIC_API_KEY = <your key from console.anthropic.com>
 *
 * The page calls POST /api/claude?model=<model> with a messages-format body.
 */
const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5-20251001',
  'claude-sonnet-5-5',
]);
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const fail = (res, status, message) => res.status(status).json({ error: { message } });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fail(res, 500, 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY');

  // Only serve requests coming from this site's own pages.
  const origin = req.headers.origin;
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch { /* malformed origin */ }
    if (originHost !== req.headers.host) return fail(res, 403, 'Forbidden origin');
  }

  const model = String(req.query.model || 'claude-haiku-4-5-20251001');
  // 404 + "not supported" lets the page fall back to the next model in its list.
  if (!ALLOWED_MODELS.has(model)) return fail(res, 404, `Model ${model} is not supported by this server`);

  const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (Buffer.byteLength(bodyStr) > MAX_BODY_BYTES) return fail(res, 413, 'รูปใหญ่เกินไป');

  try {
    const upstream = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: bodyStr,
      },
    );

    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (err) {
    return fail(res, 502, 'เชื่อมต่อ Claude ไม่สำเร็จ: ' + (err && err.message ? err.message : err));
  }
};
