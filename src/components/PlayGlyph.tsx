// Emericfolio — created by Tomi-Tom, 2026
// Play triangle shared by every video button of the site

// Hand-drawn path because iOS and Android render "▶" (U+25B6) as a color emoji.
// The triangle sits right of the viewBox center so its mass looks centered.
export default function PlayGlyph({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={className}
      style={style}
    >
      <path
        d="M8.4 5.2 19.4 12 8.4 18.8Z"
        fill="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
        stroke="currentColor"
      />
    </svg>
  );
}
