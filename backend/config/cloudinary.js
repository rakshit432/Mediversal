import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const isCloudinaryConfigured = () => !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const connectCloudinary = async () => {
  if (!isCloudinaryConfigured()) {
    console.warn("⚠️  Cloudinary credentials missing — using LOCAL FALLBACK mode active (files stored in backend/public/uploads/");
    return;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 15000,
    secure: true,
  });
  console.log("✅ Cloudinary configured (with local fallback)");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isNetworkError = (err) => {
  const code = err?.code || '';
  const msg = String(err?.message || '').toLowerCase();
  return /ENOTFOUND|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|network|getaddrinfo|dns|ECONNABORTED|fetch failed/i.test(code) ||
    /network|timeout|offline|dns|connection refused|could not connect/i.test(msg);
};

const copyToLocalPublic = (localPath) => {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}_${path.basename(localPath || 'file')}`;
  const dest = path.join(UPLOADS_DIR, unique);
  fs.copyFileSync(localPath, dest);
  return `/uploads/${unique}`;
};

export const uploadToStorage = async (localFilePath, options = {}) => {
  const { resource_type = 'auto', folder = 'mediversal' } = options;

  if (!isCloudinaryConfigured()) {
    const urlPath = copyToLocalPublic(localFilePath);
    return {
      secure_url: urlPath,
      public_id: path.basename(urlPath),
      fallback: true,
    };
  }

  const attempts = [
    { timeout: 8000 },
    { timeout: 12000 },
  ];

  let lastErr;
  for (let i = 0; i < attempts.length; i++) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type,
        folder,
        timeout: attempts[i].timeout,
      });
      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        fallback: false,
      };
    } catch (err) {
      lastErr = err;
      if (isNetworkError(err)) {
        if (i < attempts.length - 1) {
          console.warn(`[Cloudinary] Attempt ${i + 1} failed (${err.code || err.message}), retrying...`);
          await sleep(1000 * (i + 1));
          continue;
        }
        console.warn(`[Cloudinary] Network error, falling back to local storage:`, err?.code || err?.message);
        const urlPath = copyToLocalPublic(localFilePath);
        return {
          secure_url: urlPath,
          public_id: path.basename(urlPath),
          fallback: true,
          local_fallback_reason: String(err?.code || err?.message),
        };
      }
      throw err;
    }
  }
  throw lastErr;
};

export const deleteFromStorage = async (publicId, options = {}) => {
  const { resource_type = 'image' } = options;

  if (!publicId) return { ok: true };
  if (publicId.startsWith('/uploads/')) {
    try {
      const p = path.join(UPLOADS_DIR, path.basename(publicId));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {}
    return { ok: true, fallback: true };
  }
  if (!isCloudinaryConfigured()) return { ok: true };
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type, timeout: 8000 });
    return { ok: true };
  } catch (err) {
    console.warn('[Cloudinary] Delete failed (non-fatal):', err?.code || err?.message);
    return { ok: false, error: err?.message };
  }
};

export default connectCloudinary;
