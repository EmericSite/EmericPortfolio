// Emericfolio — created by Tomi-Tom, 2026
// Draws the 1200x630 preview picture shown when the site is shared on social media
import { ImageResponse } from "next/og";
import { accueil, identite, partage } from "@/content/site";
import { palette } from "@/lib/palette";

export const runtime = "edge";
export const alt = partage.titre;
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
          backgroundColor: palette.ink,
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
            {identite.nom}
          </div>
          <div
            style={{
              fontFamily: "serif",
              fontStyle: "italic",
              fontSize: 88,
              color: palette.pearl,
              marginTop: 32,
              lineHeight: 1,
            }}
          >
            {accueil.surtitre}
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
            color: palette.magenta,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
          }}
        >
          {partage.vignetteMention}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
