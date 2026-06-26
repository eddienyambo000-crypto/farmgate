import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Farmgate Rwanda — Rwanda's Livestock Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded default OG image used across the site (pages without their own image).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #122d22 0%, #1b4332 55%, #2d6a4f 100%)",
          color: "#f5f0e8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#c9a84c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#122d22",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            F
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 32, fontWeight: 700 }}>
            <span>Farmgate</span>
            <span style={{ color: "#e7c35c" }}>Rwanda</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            Healthy animals, direct from the farm.
          </div>
          <div style={{ fontSize: 30, color: "#d8f0e3", maxWidth: 900 }}>
            Buy & sell cattle, goats, pigs, chickens, sheep & rabbits from verified
            Rwandan keepers.
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#e7c35c" }}>
          <span>Verified keepers</span>
          <span>•</span>
          <span>0% buyer commission</span>
          <span>•</span>
          <span>{SITE.url.replace("https://", "")}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
