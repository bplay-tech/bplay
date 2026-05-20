import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#7C5CFF",
          borderRadius: "22%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
        }}
      >
        <div style={{ width: 150, height: 150, background: "#ffffff", borderRadius: "50%" }} />
        <div style={{ width: 150, height: 150, background: "#ffffff", borderRadius: "50%" }} />
      </div>
    ),
    { ...size }
  );
}
