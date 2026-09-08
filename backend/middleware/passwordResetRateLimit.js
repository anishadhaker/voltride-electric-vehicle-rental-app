const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const getClientKey = (req) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  return `${req.ip}:${email || "unknown"}`;
};

export const passwordResetRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = getClientKey(req);
  const recentAttempts = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: "Too many password reset attempts. Please try again later." });
  }

  recentAttempts.push(now);
  attempts.set(key, recentAttempts);
  return next();
};