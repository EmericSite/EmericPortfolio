import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Emeric Ressy — Motion Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08070C",
          position: "relative",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: 160,
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Emeric Ressy
          </div>
          <div
            style={{
              fontFamily: "serif",
              fontStyle: "italic",
              fontSize: 88,
              color: "#F4D8E2",
              marginTop: 32,
              lineHeight: 1,
            }}
          >
            Mélancolie électrique
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            fontFamily: "monospace",
            fontSize: 22,
            color: "#FF2D9C",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
          }}
        >
          MOTION · 3D · PARIS
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
