import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "가계부",
    short_name: "가계부",
    description: "개인 수입·지출 관리 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF6FA",
    theme_color: "#EEF6FA",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
