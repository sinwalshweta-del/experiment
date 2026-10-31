import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the old multi-page share wizard is now one flow at /share
  async redirects() {
    return [
      { source: "/share/:path+", destination: "/share", permanent: false },
      // old prototype pages, retired in taste audit 2 (board 25)
      { source: "/about", destination: "/", permanent: true },
      { source: "/insights/explore", destination: "/", permanent: true },
      { source: "/insights/yearly", destination: "/", permanent: true },
      { source: "/styleguide", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
