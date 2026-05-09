const buckets = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 30 } = {}) => {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now - entry.start > windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((windowMs - (now - entry.start)) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res
        .status(429)
        .json({ error: `Too many requests. Try again in ${retryAfter}s.` });
    }

    entry.count += 1;
    next();
  };
};
