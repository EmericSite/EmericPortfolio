import OpengraphImage from "./opengraph-image";

export const runtime = "edge";
export const alt = "Emeric Ressy — Motion Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OpengraphImage();
}
