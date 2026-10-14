import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import mapImage from "../assets/welcome/world-map.svg";
import connections from "../assets/welcome/connections.json";

// Adapted for Vite from Aceternity World Map (Manu Arora):
// https://ui.aceternity.com/components/world-map
export default function WorldMap() {
  const reduceMotion = useReducedMotion();
  const { width, height, dots } = connections;
  const points = [...new Map(dots.flatMap(({ start, end }) => [start, end])
    .map((point) => [`${point.x},${point.y}`, point])).values()];

  return (
    <div className="welcome-map" aria-hidden="true" style={{ aspectRatio: `${width} / ${height}` }}>
      <img src={mapImage} width={width} height={height} alt="" draggable="false" />
      <LazyMotion features={domAnimation}>
        <svg viewBox={`0 0 ${width} ${height}`} focusable="false">
          {dots.map(({ start, end }, index) => (
            <m.path
              key={index}
              d={`M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${Math.min(start.y, end.y) - height * 0.15} ${end.x} ${end.y}`}
              fill="none" stroke="#367ae8" strokeWidth="0.28"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : index * 0.22 }}
            />
          ))}
          {points.map(({ x, y }) => (
            <g key={`${x},${y}`}>
              <circle cx={x} cy={y} r="1.3" fill="#2670df" opacity="0.12" />
              <circle cx={x} cy={y} r="0.52" fill="#2670df" />
            </g>
          ))}
        </svg>
      </LazyMotion>
    </div>
  );
}
