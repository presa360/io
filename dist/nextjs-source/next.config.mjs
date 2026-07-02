/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pptxgenjs is used only inside server route handlers; keep it external so
  // Next doesn't try to bundle its browser build into the server output.
  experimental: {
    serverComponentsExternalPackages: ["pptxgenjs"],
  },
};

export default nextConfig;
