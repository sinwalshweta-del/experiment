import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the old multi-page share wizard is now one flow at /share
  async redirects() {
    return [{ source: "/share/:path+", destination: "/share", permanent: false }];
  },
};

export default nextConfig;
