/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML in `out/` — deployable from repo root on Vercel (avoids Python detection on `requirements.txt`).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
