// Emericfolio — created by Tomi-Tom, 2026
// Draws the 1200x630 preview picture shown when the site is shared on social media
import { ImageResponse } from "next/og";
import { partage } from "@/content/site";

export const runtime = "edge";
export const alt = partage.titre;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <img
        src={new URL("og-cover.jpg", partage.url).toString()}
        width={1200}
        height={630}
        style={{ objectFit: "cover" }}
      />
    ),
    { ...size },
  );
}