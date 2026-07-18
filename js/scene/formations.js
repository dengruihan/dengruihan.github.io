/* Formation generators — one Float32Array layout per story chapter.
   Every formation has exactly N cubes so the morph engine can blend
   between any two chapters. Generators are deterministic (seeded RNG). */
import { COLORS } from './palette.js'

export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const tmpColor = { r: 0, g: 0, b: 0 }
function hexToRgb(hex) {
  tmpColor.r = ((hex >> 16) & 255) / 255
  tmpColor.g = ((hex >> 8) & 255) / 255
  tmpColor.b = (hex & 255) / 255
  return tmpColor
}

function writeColor(arr, i, hex, brightness = 1) {
  const c = hexToRgb(hex)
  arr[i * 3] = Math.min(1, c.r * brightness)
  arr[i * 3 + 1] = Math.min(1, c.g * brightness)
  arr[i * 3 + 2] = Math.min(1, c.b * brightness)
}

function makeFormation(N) {
  return {
    pos: new Float32Array(N * 3),
    color: new Float32Array(N * 3),
    scale: new Float32Array(N),
    extras: {},
  }
}

/* --- CH 0: assembled server-rack silhouette (cubes hidden until explosion) --- */
export function buildServer(N, rng) {
  const f = makeFormation(N)
  const W = 2.4, H = 3.4, D = 1.4
  for (let i = 0; i < N; i++) {
    const r = rng()
    let x, y, z
    if (r < 0.72) {
      // shell — weighted faces, front (panel side) densest
      const face = rng()
      const jx = (rng() - 0.5), jy = (rng() - 0.5)
      if (face < 0.34) { x = jx * W; y = jy * H; z = D / 2 }
      else if (face < 0.48) { x = jx * W; y = jy * H; z = -D / 2 }
      else if (face < 0.62) { x = -W / 2; y = jy * H; z = jx * D }
      else if (face < 0.76) { x = W / 2; y = jy * H; z = jx * D }
      else if (face < 0.88) { x = jx * W; y = H / 2; z = jy * D }
      else { x = jx * W; y = -H / 2; z = jy * D }
      x += (rng() - 0.5) * 0.05
      y += (rng() - 0.5) * 0.05
      z += (rng() - 0.5) * 0.05
    } else {
      x = (rng() - 0.5) * W * 0.85
      y = (rng() - 0.5) * H * 0.85
      z = (rng() - 0.5) * D * 0.85
    }
    f.pos[i * 3] = x
    f.pos[i * 3 + 1] = y
    f.pos[i * 3 + 2] = z
    f.scale[i] = 0.06 + rng() * 0.055

    const accent = rng()
    if (accent < 0.06) writeColor(f.color, i, COLORS.egg, 1.1)
    else if (accent < 0.09) writeColor(f.color, i, COLORS.signal, 1.0)
    else writeColor(f.color, i, rng() < 0.5 ? COLORS.water2 : COLORS.reedDim, 0.5 + rng() * 0.5)
  }
  return f
}

/* --- CH 1: server loosening apart (About transition) --- */
export function buildCloud(N, rng, server) {
  const f = makeFormation(N)
  for (let i = 0; i < N; i++) {
    const sx = server.pos[i * 3], sy = server.pos[i * 3 + 1], sz = server.pos[i * 3 + 2]
    let dx = sx + (rng() - 0.5) * 1.4
    let dy = sy + (rng() - 0.5) * 1.4
    let dz = sz + (rng() - 0.5) * 1.4
    const len = Math.hypot(dx, dy, dz) || 1
    const dist = 1.1 + rng() * 3.0
    // slight orbital swirl so the disassembly reads as rotation, not noise
    const swirl = (rng() - 0.5) * 1.6
    f.pos[i * 3] = sx + (dx / len) * dist + (-dz / len) * swirl
    f.pos[i * 3 + 1] = sy + (dy / len) * dist * 0.8
    f.pos[i * 3 + 2] = sz + (dz / len) * dist + (dx / len) * swirl
    f.scale[i] = server.scale[i] * (0.85 + rng() * 0.3)
    f.color[i * 3] = server.color[i * 3]
    f.color[i * 3 + 1] = server.color[i * 3 + 1]
    f.color[i * 3 + 2] = server.color[i * 3 + 2]
  }
  return f
}

/* --- CH 2: neural-network layers (Skills) --- */
export function buildLayers(N, rng) {
  const f = makeFormation(N)
  // grid sizes per layer shrink on small budgets (scene-lite)
  const spec = N >= 600
    ? [{ x: -3.6, g: 9 }, { x: -1.2, g: 12 }, { x: 1.2, g: 12 }, { x: 3.6, g: 7 }]
    : [{ x: -3.0, g: 6 }, { x: -1.0, g: 8 }, { x: 1.0, g: 8 }, { x: 3.0, g: 5 }]
  const spacing = 0.42
  const centerY = 0.45
  const layerNodes = []
  let i = 0
  for (const { x, g } of spec) {
    const nodes = []
    for (let row = 0; row < g && i < N; row++) {
      for (let col = 0; col < g && i < N; col++) {
        f.pos[i * 3] = x
        f.pos[i * 3 + 1] = centerY + (row - (g - 1) / 2) * spacing
        f.pos[i * 3 + 2] = (col - (g - 1) / 2) * spacing
        f.scale[i] = 0.075 + rng() * 0.03
        writeColor(f.color, i, rng() < 0.14 ? COLORS.signal : COLORS.egg, 0.85 + rng() * 0.35)
        nodes.push(i)
        i++
      }
    }
    layerNodes.push(nodes)
  }
  // remaining cubes: "signals" drifting between layers
  const signalStart = i
  const spanX = spec[spec.length - 1].x - spec[0].x
  for (; i < N; i++) {
    f.pos[i * 3] = spec[0].x + rng() * spanX
    f.pos[i * 3 + 1] = centerY + (rng() - 0.5) * 5.2
    f.pos[i * 3 + 2] = (rng() - 0.5) * 5.2
    f.scale[i] = 0.028 + rng() * 0.022
    writeColor(f.color, i, rng() < 0.3 ? COLORS.signal : COLORS.reedDim, 0.3 + rng() * 0.35)
  }
  f.extras = { layerNodes, signalStart, minX: spec[0].x, maxX: spec[spec.length - 1].x, centerY }
  return f
}

/* --- CH 3: flowing wave field (Journey) --- */
export const WAVE_BASE_Y = -0.8
export function waveHeight(x, z, time) {
  return Math.sin(x * 0.42 + time * 1.5) * 0.55 + Math.cos(z * 0.55 + time * 1.05) * 0.45
}

export function buildWave(N, rng) {
  const f = makeFormation(N)
  const cols = Math.round(Math.sqrt(N * 1.55))
  const rows = Math.max(8, Math.floor(N / cols))
  const gridCount = cols * rows
  const x0 = -11, x1 = 11, z0 = -7, z1 = 7
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + (c / (cols - 1)) * (x1 - x0)
      const z = z0 + (r / (rows - 1)) * (z1 - z0)
      f.pos[i * 3] = x + (rng() - 0.5) * 0.3
      f.pos[i * 3 + 1] = WAVE_BASE_Y
      f.pos[i * 3 + 2] = z + (rng() - 0.5) * 0.3
      f.scale[i] = 0.08 + rng() * 0.05
      const k = (x - x0) / (x1 - x0)
      const accent = rng()
      if (accent < 0.04) writeColor(f.color, i, COLORS.egg, 0.9)
      else if (accent < 0.08) writeColor(f.color, i, COLORS.signal, 0.85)
      else writeColor(f.color, i, COLORS.reedDim, 0.45 + k * 0.55)
      i++
    }
  }
  // spillover cubes hover as mist above the wave
  for (; i < N; i++) {
    f.pos[i * 3] = x0 + rng() * (x1 - x0)
    f.pos[i * 3 + 1] = WAVE_BASE_Y + 0.6 + rng() * 2.2
    f.pos[i * 3 + 2] = z0 + rng() * (z1 - z0)
    f.scale[i] = 0.03 + rng() * 0.025
    writeColor(f.color, i, COLORS.reed, 0.35 + rng() * 0.3)
  }
  f.extras = { gridCount }
  return f
}

/* --- CH 4: depth deck of mosaic panels (Projects) --- */
export const DECK_SPACING = 2.7
export const DECK_PANEL_TINTS = [COLORS.egg, COLORS.signal, COLORS.reed, COLORS.mist]

export function buildDeck(N, rng, panelCount) {
  const f = makeFormation(N)
  const perPanel = Math.floor((N * 0.72) / panelCount)
  const cols = Math.max(6, Math.round(Math.sqrt(perPanel * 1.5)))
  const rows = Math.max(4, Math.floor(perPanel / cols))
  const gap = 0.155
  const panelOf = new Int8Array(N).fill(-1)
  const localXY = new Float32Array(N * 2)
  const bases = []
  let i = 0
  for (let p = 0; p < panelCount; p++) {
    const base = { x: p * 0.55 - 0.7, y: 0.35 + p * 0.15, z: -p * DECK_SPACING }
    bases.push(base)
    const tint = DECK_PANEL_TINTS[p % DECK_PANEL_TINTS.length]
    for (let r = 0; r < rows && i < N; r++) {
      for (let c = 0; c < cols && i < N; c++) {
        panelOf[i] = p
        const lx = (c - (cols - 1) / 2) * gap
        const ly = (r - (rows - 1) / 2) * gap
        localXY[i * 2] = lx
        localXY[i * 2 + 1] = ly
        f.pos[i * 3] = base.x + lx
        f.pos[i * 3 + 1] = base.y + ly
        f.pos[i * 3 + 2] = base.z + (rng() - 0.5) * 0.05
        f.scale[i] = 0.062 + rng() * 0.02
        writeColor(f.color, i, tint, rng() < 0.05 ? 1.4 : 0.55 + rng() * 0.5)
        i++
      }
    }
  }
  // ambient dust around the deck
  for (; i < N; i++) {
    f.pos[i * 3] = (rng() - 0.5) * 13
    f.pos[i * 3 + 1] = (rng() - 0.5) * 7
    f.pos[i * 3 + 2] = -8 + rng() * 10
    f.scale[i] = 0.028 + rng() * 0.025
    writeColor(f.color, i, COLORS.reedDim, 0.3 + rng() * 0.35)
  }
  f.extras = { panelOf, localXY, bases, cols, rows }
  return f
}

/* Per-frame deck pose. ci = continuous "card index" (0 .. panelCount-1). */
export function deckPanelPose(j, ci) {
  const d = j - ci // >0 behind front, <0 exiting
  const z = -d * DECK_SPACING
  const lift = d < 0 ? Math.min(1, -d * 1.5) : 0
  return { z, liftY: lift * 3.8, lift, d }
}

/* --- CH 5: deep-space wall (Blog) --- */
export const BLOG_WALL_Z = -10.5
export function blogSlot(j, count) {
  const gap = count > 1 ? Math.min(5.6, 14 / (count - 1)) : 0
  const x = (j - (count - 1) / 2) * gap
  return { x, y: 0.95, z: BLOG_WALL_Z + 0.4 }
}

export function buildWall(N, rng, cardCount) {
  const f = makeFormation(N)
  const cols = 30, rows = 15
  const x0 = -8.5, x1 = 8.5, y0 = -2.2, y1 = 4.6
  const slots = Array.from({ length: cardCount }, (_, j) => blogSlot(j, cardCount))
  let i = 0
  const fillProb = Math.min(0.9, (N * 0.55) / (cols * rows))
  for (let r = 0; r < rows && i < N; r++) {
    for (let c = 0; c < cols && i < N; c++) {
      if (rng() > fillProb) continue
      const x = x0 + (c / (cols - 1)) * (x1 - x0)
      const y = y0 + (r / (rows - 1)) * (y1 - y0)
      // leave gaps where the blog cards land
      if (slots.some((s) => Math.abs(x - s.x) < 1.5 && Math.abs(y - s.y) < 1.15)) continue
      f.pos[i * 3] = x + (rng() - 0.5) * 0.4
      f.pos[i * 3 + 1] = y + (rng() - 0.5) * 0.4
      f.pos[i * 3 + 2] = BLOG_WALL_Z + (rng() - 0.5) * 0.8
      f.scale[i] = 0.045 + rng() * 0.04
      writeColor(f.color, i, rng() < 0.06 ? COLORS.mist : COLORS.reedDim, 0.45 + rng() * 0.5)
      i++
    }
  }
  // the rest become deep-space debris behind the wall
  for (; i < N; i++) {
    f.pos[i * 3] = (rng() - 0.5) * 26
    f.pos[i * 3 + 1] = (rng() - 0.5) * 14 + 1
    f.pos[i * 3 + 2] = BLOG_WALL_Z - 1 - rng() * 11
    f.scale[i] = 0.03 + rng() * 0.03
    writeColor(f.color, i, COLORS.reedDim, 0.25 + rng() * 0.3)
  }
  return f
}

/* --- CH 6: constellation graph (Friend links) ---
   Explicit screen-tested layout: teacher center-low, students in a wide
   arc behind — chosen so HTML cards never stack on screen. */
let GRAPH_SCALE = 1
export function setGraphScale(s) {
  GRAPH_SCALE = s
}

export function graphNodeBase(k, count, teacherIndex) {
  const b = graphNodeBaseUnscaled(k, count, teacherIndex)
  return { x: b.x * GRAPH_SCALE, y: b.y * GRAPH_SCALE, z: b.z * GRAPH_SCALE }
}

function graphNodeBaseUnscaled(k, count, teacherIndex) {
  if (k === teacherIndex) return { x: 0, y: 0.2, z: 0 }
  const others = []
  for (let n = 0; n < count; n++) if (n !== teacherIndex) others.push(n)
  const slot = others.indexOf(k)
  const LAYOUTS = {
    3: [
      { x: -4.2, y: 1.4, z: -1.2 },
      { x: 0, y: 2.5, z: -2.2 },
      { x: 4.2, y: 1.4, z: -1.2 },
    ],
    2: [
      { x: -3.6, y: 1.6, z: -1.4 },
      { x: 3.6, y: 1.6, z: -1.4 },
    ],
    4: [
      { x: -4.6, y: 1.2, z: -1.2 },
      { x: -1.6, y: 2.5, z: -2.2 },
      { x: 1.6, y: 2.5, z: -2.2 },
      { x: 4.6, y: 1.2, z: -1.2 },
    ],
  }
  const table = LAYOUTS[others.length]
  if (table) return table[Math.min(slot, table.length - 1)]
  const angle = (-90 + slot * (360 / others.length) + 30) * (Math.PI / 180)
  return { x: Math.cos(angle) * 4.2, y: 1.4 + Math.sin(angle * 2) * 0.4, z: Math.sin(angle) * 2.6 }
}

export function graphNodePose(k, count, teacherIndex, time) {
  const base = graphNodeBase(k, count, teacherIndex)
  if (k === teacherIndex) {
    return {
      x: base.x + Math.cos(time * 0.4) * 0.08,
      y: base.y + Math.sin(time * 0.7) * 0.1,
      z: base.z + Math.sin(time * 0.33) * 0.08,
    }
  }
  return {
    x: base.x + Math.cos(time * 0.5 + k * 1.3) * 0.12,
    y: base.y + Math.sin(time * 0.7 + k * 2.1) * 0.16,
    z: base.z,
  }
}

export function buildGraph(N, rng, count, teacherIndex) {
  const f = makeFormation(N)
  const nodeOf = new Int8Array(N).fill(-1)
  const perNode = Math.floor(N * 0.6 / count)
  let i = 0
  for (let k = 0; k < count; k++) {
    const center = graphNodeBase(k, count, teacherIndex)
    const tint = k === teacherIndex ? COLORS.signal : COLORS.egg
    for (let n = 0; n < perNode && i < N; n++) {
      nodeOf[i] = k
      // gaussian-ish cluster
      const gx = (rng() + rng() + rng() - 1.5) * 0.72
      const gy = (rng() + rng() + rng() - 1.5) * 0.72
      const gz = (rng() + rng() + rng() - 1.5) * 0.72
      f.pos[i * 3] = center.x + gx
      f.pos[i * 3 + 1] = center.y + gy
      f.pos[i * 3 + 2] = center.z + gz
      f.scale[i] = 0.07 + rng() * 0.055
      writeColor(f.color, i, tint, 0.6 + rng() * 0.6)
      i++
    }
  }
  // ambient ring of distant cubes
  for (; i < N; i++) {
    const a = rng() * Math.PI * 2
    const r = 5 + rng() * 3.5
    f.pos[i * 3] = Math.cos(a) * r
    f.pos[i * 3 + 1] = (rng() - 0.5) * 5 + 1
    f.pos[i * 3 + 2] = Math.sin(a) * r * 0.8
    f.scale[i] = 0.028 + rng() * 0.025
    writeColor(f.color, i, COLORS.reedDim, 0.3 + rng() * 0.3)
  }
  f.extras = { nodeOf }
  return f
}

/* --- CH 7: distant mini server bookend (Contact) --- */
export const OUTRO_CENTER = { x: 0, y: 0.1, z: -8 }
export function buildOutro(N, rng, server) {
  const f = makeFormation(N)
  const s = 0.42
  for (let i = 0; i < N; i++) {
    f.pos[i * 3] = OUTRO_CENTER.x + server.pos[i * 3] * s
    f.pos[i * 3 + 1] = OUTRO_CENTER.y + server.pos[i * 3 + 1] * s
    f.pos[i * 3 + 2] = OUTRO_CENTER.z + server.pos[i * 3 + 2] * s
    f.scale[i] = server.scale[i] * 0.95
    f.color[i * 3] = Math.min(1, server.color[i * 3] * 1.1)
    f.color[i * 3 + 1] = Math.min(1, server.color[i * 3 + 1] * 1.1)
    f.color[i * 3 + 2] = Math.min(1, server.color[i * 3 + 2] * 1.1)
  }
  return f
}

/* Build all 8 chapter formations. DOM counts decide panel/card/node splits. */
export function buildAllFormations(N, seed, counts) {
  const rng = mulberry32(seed)
  const server = buildServer(N, rng)
  return [
    server,
    buildCloud(N, rng, server),
    buildLayers(N, rng),
    buildWave(N, rng),
    buildDeck(N, rng, counts.projects),
    buildWall(N, rng, counts.blog),
    buildGraph(N, rng, counts.links, counts.teacherIndex),
    buildOutro(N, rng, server),
  ]
}
