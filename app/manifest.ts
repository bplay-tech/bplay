import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BPLAY Partner Portal",
    short_name: "BPLAY",
    description: "Manage your BPLAY partner commissions, referrals, and payouts",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0F1A",
    theme_color: "#7C5CFF",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
