import { MapPin } from "lucide-react";

// A generated patchwork-farmland illustration standing in for an aerial photo.
// Using a self-contained SVG instead of a maps API/stock image keeps the
// deployed demo free of external API keys and network dependencies.
const PATCHES = [
  { x: 0, y: 0, w: 28, h: 34, fill: "#65a30d" },
  { x: 28, y: 0, w: 30, h: 22, fill: "#84cc16" },
  { x: 58, y: 0, w: 42, h: 30, fill: "#4d7c0f" },
  { x: 0, y: 34, w: 24, h: 30, fill: "#ca8a04" },
  { x: 24, y: 22, w: 34, h: 26, fill: "#a3e635" },
  { x: 58, y: 30, w: 22, h: 34, fill: "#65a30d" },
  { x: 80, y: 30, w: 20, h: 28, fill: "#92400e" },
  { x: 0, y: 64, w: 30, h: 36, fill: "#4d7c0f" },
  { x: 30, y: 48, w: 28, h: 52, fill: "#b45309" },
  { x: 58, y: 64, w: 42, h: 36, fill: "#84cc16" },
];

export function FieldMap({
  x,
  y,
  label,
  className = "",
}: {
  x: number;
  y: number;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label={label ? `Map showing ${label}` : "Field map"}
    >
      {PATCHES.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />
      ))}
      {/* subtle row texture */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={i * 5}
          x2={100}
          y2={i * 5}
          stroke="black"
          strokeOpacity={0.04}
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <g transform={`translate(${x} ${y})`}>
        <circle r={3.2} fill="#2563eb" stroke="white" strokeWidth={0.8} />
      </g>
    </svg>
  );
}

export function MapPinLabel() {
  return <MapPin size={14} />;
}
