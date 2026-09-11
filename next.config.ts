import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Photos/avatars hébergés sur Cloudflare R2 (voir strImmo/src/storage/storage.service.ts,
      // R2_PUBLIC_URL) — motif générique (pas le seul sous-domaine actuel) pour survivre à une
      // rotation du bucket sans retoucher ce fichier.
      { protocol: "https", hostname: "*.r2.dev" },
      // Anciennes photos encore hébergées sur Cloudinary (avant la migration vers R2) — certaines
      // annonces existantes en base y pointent toujours.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
