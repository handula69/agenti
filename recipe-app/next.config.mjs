/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Appka mění data často (nové/upravené/smazané recepty) a je nízko-provozní,
    // takže se vyplatí vypnout klientskou cache stránek úplně - jinak Next.js
    // po interní ("tiché") navigaci občas ukazoval starou verzi seznamu receptů.
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
