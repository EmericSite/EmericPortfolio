// Emericfolio — created by Tomi-Tom, 2026
// Reuses the social preview picture for X/Twitter cards
import OpengraphImage from "./opengraph-image";
import { partage } from "@/content/site";

export const runtime = "edge";
export const alt = partage.titre;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OpengraphImage();
}
