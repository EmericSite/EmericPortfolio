// Triangle de lecture en SVG. Le caractère « ▶ » (U+25B6) est rendu comme un
// emoji couleur par iOS et Android, ce qui cassait la sobriété du bouton sur
// mobile. Un tracé maison garde la même forme partout et suit currentColor.
//
// Le triangle est décalé dans le viewBox pour que son centre de masse tombe au
// milieu : centré géométriquement, un triangle pointant à droite paraît collé
// à droite.
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
