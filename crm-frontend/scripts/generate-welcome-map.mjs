import { mkdir, writeFile } from "node:fs/promises";
import DottedMap from "dotted-map";

// Precompute the decorative map so country geometry never ships as browser JS.
const map = new DottedMap({ height: 100, grid: "diagonal" });
const locations = {
  buenosAires: { lat: -34.6037, lng: -58.3816 },
  brasilia: { lat: -15.7975, lng: -47.8919 },
  losAngeles: { lat: 34.0522, lng: -118.2437 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  london: { lat: 51.5074, lng: -0.1278 },
  delhi: { lat: 28.6139, lng: 77.209 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
};
const connections = [
  ["buenosAires", "brasilia"], ["brasilia", "losAngeles"],
  ["brasilia", "lisbon"], ["london", "delhi"], ["delhi", "nairobi"],
];
const point = (name) => {
  const { x, y } = map.getPin(locations[name]);
  return { x, y };
};
const output = new URL("../src/assets/welcome/", import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL("world-map.svg", output), map.getSVG({
  radius: 0.22, color: "#b6c5d8", shape: "circle", backgroundColor: "transparent",
}));
await writeFile(new URL("connections.json", output), JSON.stringify({
  width: map.image.width,
  height: map.image.height,
  dots: connections.map(([start, end]) => ({ start: point(start), end: point(end) })),
}, null, 2) + "\n");
