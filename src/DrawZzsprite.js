export function DrawZzSprite({
  context,
  x = 0,
  y = 0,
  seed = "1",
  size = 16,
  mode = 0,
  mutateSeed = 0,
  colorSeed = 0,
}) {
  function Random(max = 1, min = 0) {
    randomSeed ^= randomSeed << 13;
    randomSeed ^= randomSeed >>> 17;
    return (
      ((Math.abs((randomSeed ^= randomSeed << 5)) % 1e9) / 1e9) * (max - min) +
      min
    );
  }

  // random chance to flip drawing axis
  let randomSeed = seed;
  const flipAxis = Random() < 0.5;
  const w = flipAxis ? size - 3 : (size / 2 - 1) | 0;
  const h = !flipAxis ? size - 3 : (size / 2 - 1) | 0;

  // apply mutations
  randomSeed += mutateSeed + 1e8;
  const spriteSize = size * Random(0.9, 0.6);
  const density = Random(1, 0.9);
  const doubleCenter = Random() < 0.5;
  const yBias = Random(0.1, -0.1);
  const colorRand = mode == 1 ? 0.08 : 0.04;

  // // recenter
  // x += (size / 2) | 0;
  // y += (size / 2) | 0;

  function DrawSpriteInternal(x, y, outline) {
    // draw each pixel
    let maxX = 0;
    let maxY = 0;
    randomSeed = seed;
    const passCount = mode == 3 ? 3 : 1;
    for (let pass = 0; pass < passCount; ++pass)
      for (let k = 0; k < w * h; ++k) {
        const i = flipAxis ? (k / w) | 0 : k % w;
        const j = !flipAxis ? (k / w) | 0 : k % w;

        // pick new random color using color seed
        const saveSeed = randomSeed;
        randomSeed += colorSeed + 1e9;
        const r = Random(360) | 0;
        let newColor = `hsl(${r},${Random(200, 0) | 0}%,${
          Random(100, 20) | 0
        }%)`;
        if (outline || mode == 3) newColor = "#000";
        else if (mode == 1)
          newColor = r % 3 ? (r % 3 == 1 ? "#444" : "#999") : "#fff";
        else if (mode == 2) newColor = `#fff`;
        if (!k || Random() < colorRand) context.fillStyle = newColor;
        randomSeed = saveSeed;

        // check if pixel should be drawn
        const isHole = Random() > density;
        if (
          Random(spriteSize / 2) ** 2 >
            i * i + (j - ((1 - 2 * yBias) * h) / 2) ** 2 &&
          !isHole
        ) {
          const o = !!outline;
          context.fillRect(
            x + i - o - doubleCenter,
            y + j - o,
            1 + 2 * o,
            1 + 2 * o
          );
          context.fillRect(x - i - o, y + j - o, 1 + 2 * o, 1 + 2 * o);

          const xCalc = x - i - o;
          const yCalc = y + j - o;
          if (xCalc < maxX) maxX = xCalc;
          if (yCalc > maxY) maxY = yCalc;
        }
      }
    // context.translate(-maxX * 1.5, maxY / 2);
  }

  // outline then fill
  if (mode != 3) DrawSpriteInternal(x, y, 1);
  DrawSpriteInternal(x, y);
}
