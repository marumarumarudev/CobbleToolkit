/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  // trailingSlash: true,
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
};

export default nextConfig;
