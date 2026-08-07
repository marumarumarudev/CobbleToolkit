// Set this to your repo name for GitHub Pages project sites
// (https://<user>.github.io/cobbletoolkit/). Leave both empty if this
// deploys to a user/org root page (https://<user>.github.io/) or a
// custom domain instead.
const repoName = "CobbleToolkit";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? `/${repoName}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
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
