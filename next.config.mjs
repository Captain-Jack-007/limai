/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'pptxgenjs', 'docx'],
  },
  env: {
    MINIMAX_API_KEY: 'sk-cp-_d81eoJd0o7icAdi_tt-XfDebeLZEghhqQxdQJ-Ll2FhtAl6Z_1f2Ee5nbYZbpDVCJuAfg341WpUtsQXrIj7KKaKtdrAJam1t1E4wcITtdMfbnvCCigiv3M',
  },
};

export default nextConfig;
