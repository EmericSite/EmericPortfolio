// Emericfolio — created by Tomi-Tom, 2026
// Draws the 1200x630 preview picture shown when the site is shared on social media
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { partage } from "@/content/site";

export const alt = partage.titre;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const imageBuffer = readFileSync(join(process.cwd(), "public/og-cover.jpg"));
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <img
        src={base64Image}
        width={1200}
        height={630}
        style={{ objectFit: "cover" }}
      />
    ),
    { ...size },
  );
}