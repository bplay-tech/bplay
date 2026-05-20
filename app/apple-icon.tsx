import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0F0F1A",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 100,
            fontWeight: 700,
            lineHeight: 1,
            marginTop: "-6px",
          }}
        >
          b
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#7C5CFF",
            }}
          />
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#7C5CFF",
            }}
          />
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
