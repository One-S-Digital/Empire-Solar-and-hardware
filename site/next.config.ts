import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // IndexNow ownership file: /{INDEXNOW_KEY}.txt is answered by app/indexnow-key
  async rewrites() {
    const key = process.env.INDEXNOW_KEY;
    return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? [{ source: `/${key}.txt`, destination: "/indexnow-key" }] : [];
  },
};

export default nextConfig;
