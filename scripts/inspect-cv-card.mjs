import fs from "node:fs";
const source = fs.readFileSync("client/src/pages/Home.tsx", "utf8");
const marker = "seekerCvQuery.data";
let cursor = 0;
for (let i = 0; i < 3; i += 1) {
  const index = source.indexOf(marker, cursor);
  if (index < 0) break;
  console.log(`--- match ${i + 1} ---`);
  console.log(source.slice(Math.max(0, index - 700), index + 1000));
  cursor = index + marker.length;
}
