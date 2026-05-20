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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            background: "#16162A",
            borderRadius: 24,
            border: "2px solid #7C5CFF",
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>b</span>
          <span style={{ width: 14, height: 14, background: "#7C5CFF", borderRadius: "50%", marginLeft: 6, marginBottom: 28 }} />
          <span style={{ width: 14, height: 14, background: "#7C5CFF", borderRadius: "50%", marginLeft: 4, marginBottom: 28 }} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: "#ffffff", letterSpacing: -3 }}>BPLAY</span>
        </div>
        <p style={{ fontSize: 30, color: "#6B7280", marginTop: 12, letterSpacing: 2 }}>
          PARTNER PORTAL
        </p>
      </div>
    ),
    { ...size }
  );
}
