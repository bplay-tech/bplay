import { ImageResponse } from "next/og";

export const alt = "BPLAY Partner Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F0F1A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          gap: 32,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            background: "#7C5CFF",
            borderRadius: "22%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <div style={{ width: 32, height: 32, background: "#ffffff", borderRadius: "50%" }} />
          <div style={{ width: 32, height: 32, background: "#ffffff", borderRadius: "50%" }} />
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: "#ffffff", letterSpacing: -3 }}>
            BPLAY
          </span>
          <span style={{ fontSize: 28, color: "#6B7280", letterSpacing: 4 }}>
            PARTNER PORTAL
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
