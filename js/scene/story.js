/* Story — scroll-driven choreography for the 8 survey chapters.
   Owns: per-chapter cube animations (wave, deck scrub, graph float...),
   camera keyframes, fog, LED server model, connection lines, starfield,
   and the world-space anchors that HTML overlay cards follow. */
import * as THREE from 'three'
import { COLORS } from './palette.js'
import {
  WAVE_BASE_Y,
  waveHeight,
  DECK_SPACING,
  deckPanelPose,
  blogSlot,
  graphNodePose,
  OUTRO_CENTER,
  mulberry32,
} from './formations.js'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => {
  x = clamp01(x)
  return x * x * (3 - 2 * x)
}
const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const lerp = (a, b, k) => a + (b - a) * k

/* camera + fog keyframes per chapter */
const KEYFRAMES = [
  { pos: [5.6, 1.5, 8.6], look: [0, 0.2, 0], fog: [10, 30] }, // 0 hero
  { pos: [6.8, 3.4, 10.5], look: [0, 0.5, 0], fog: [10, 30] }, // 1 about
  { pos: [10.2, 2.6, 5.4], look: [-1.4, 0.4, 0], fog: [9, 28] }, // 2 skills
  { pos: [8.2, 6.4, -6.2], look: [0, -0.2, 0], fog: [11, 34] }, // 3 journey (back-right-top)
  { pos: [0.2, 0.8, 10.2], look: [0.2, 0.4, -2.5], fog: [8, 26] }, // 4 projects
  { pos: [0, 1.5, 8.6], look: [0, 0.9, -10.5], fog: [6, 30] }, // 5 blog (deep space)
  { pos: [0, 2.2, 11.6], look: [0, 0.95, 0], fog: [9, 28] }, // 6 links
  { pos: [0, 1.6, 9.6], look: [0, 0.2, -8], fog: [8, 26] }, // 7 contact
]

/* hero close-up target (scrubbed by chapter-0 progress) */
const HERO_NEAR = { pos: [0.5, 0.85, 3.5], look: [-0.1, 0.7, 0.72] }

const JOURNEY_LANES = [-3.2, 0.4, 3.4, -1.6]

export class Story {
  constructor({ scene, cubeField, formations, server, overlays, dom, lite }) {
    this.scene = scene
    this.field = cubeField
    this.formations = formations
    this.server = server
    this.overlays = overlays
    this.dom = dom
    this.lite = lite

    this.fog = new THREE.Fog(COLORS.ink, 10, 30)
    scene.fog = this.fog

    // portrait screens see a narrower slice of the world — pull the
    // camera back for the wide chapters
    this.keyframes = KEYFRAMES.map((k) => ({ pos: [...k.pos], look: [...k.look], fog: [...k.fog] }))
    if (lite) {
      for (const i of [3, 6]) {
        this.keyframes[i].pos = this.keyframes[i].pos.map((v) => v * 1.18)
      }
    }

    this._buildStars()
    this._buildNeuralLines()
    this._buildGraphLines()
    this._buildAnchors()
    this._registerOverlays()
  }

  /* ---------- static-ish scene furniture ---------- */

  _buildStars() {
    const rng = mulberry32(99)
    const count = this.lite ? 160 : 380
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 16 + rng() * 26
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 - 3
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.starMat = new THREE.PointsMaterial({
      color: COLORS.mist,
      size: 0.07,
      transparent: true,
      opacity: 0.15,
      toneMapped: false,
      fog: false,
    })
    this.stars = new THREE.Points(geo, this.starMat)
    this.scene.add(this.stars)
  }

  _buildNeuralLines() {
    const { layerNodes } = this.formations[2].extras
    const layerPos = this.formations[2].pos
    const rng = mulberry32(1234)
    const pts = []
    for (let l = 0; l < layerNodes.length - 1; l++) {
      for (const a of layerNodes[l]) {
        // each node links to 2 random nodes in the next layer
        for (let n = 0; n < 2; n++) {
          const next = layerNodes[l + 1]
          const b = next[Math.floor(rng() * next.length)]
          pts.push(
            layerPos[a * 3], layerPos[a * 3 + 1], layerPos[a * 3 + 2],
            layerPos[b * 3], layerPos[b * 3 + 1], layerPos[b * 3 + 2]
          )
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    this.neuralMat = new THREE.LineBasicMaterial({
      color: COLORS.egg,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    this.neuralLines = new THREE.LineSegments(geo, this.neuralMat)
    this.scene.add(this.neuralLines)
  }

  _buildGraphLines() {
    const count = this.dom.links.length
    const edges = []
    for (let a = 0; a < count; a++) for (let b = a + 1; b < count; b++) edges.push([a, b])
    this.graphEdges = edges
    const geo = new THREE.BufferGeometry()
    this.graphLinePos = new Float32Array(edges.length * 6)
    geo.setAttribute('position', new THREE.BufferAttribute(this.graphLinePos, 3))
    this.graphMat = new THREE.LineBasicMaterial({
      color: COLORS.reed,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    this.graphLines = new THREE.LineSegments(geo, this.graphMat)
    this.scene.add(this.graphLines)
  }

  /* ---------- overlay anchors ---------- */

  _buildAnchors() {
    const rng = mulberry32(555)
    this.anchors = {
      journey: this.dom.journey.map(() => ({ x: 0, y: 0, z: 0, opacity: 0, scale: 1 })),
      projects: this.dom.projects.map(() => ({ x: 0, y: 0, z: 0, opacity: 0, scale: 1 })),
      blog: this.dom.blog.map((_, j) => ({
        x: 0, y: 0, z: 0, opacity: 0, scale: 1,
        start: { x: (j - 1) * 7 + (rng() - 0.5) * 4, y: -1 + rng() * 4, z: 15 + j * 4 },
        sway: (rng() - 0.5) * 3,
      })),
      links: this.dom.links.map(() => ({ x: 0, y: 0, z: 0, opacity: 0, scale: 1 })),
    }
  }

  _registerOverlays() {
    this.dom.journey.forEach((el, i) =>
      this.overlays.add(el, () => this.anchors.journey[i], 'scene-card--journey')
    )
    this.dom.projects.forEach((el, i) =>
      this.overlays.add(el, () => this.anchors.projects[i], 'scene-card--project')
    )
    this.dom.blog.forEach((el, i) =>
      this.overlays.add(el, () => this.anchors.blog[i], 'scene-card--blog')
    )
    this.dom.links.forEach((el, i) =>
      this.overlays.add(el, () => this.anchors.links[i], 'scene-card--link')
    )
  }

  /* deck scrub: continuous card index with dwell at each integer */
  _deckCi(scrub) {
    const count = this.dom.projects.length
    const raw = clamp01(scrub) * (count - 1)
    const step = Math.floor(raw)
    const frac = raw - step
    const e = smooth((frac - 0.22) / 0.56)
    return Math.min(step + e, count - 1)
  }

  /* ---------- per-frame update ---------- */

  update(t, holds, time) {
    const field = this.field
    const { pos, scale } = field.scratch
    const w = (k) => field.chapterWeight(k)

    /* -- ch2 skills: signal drift + node pulse -- */
    const w2 = w(2)
    if (w2 > 0.01) {
      const ex = this.formations[2].extras
      const span = ex.maxX - ex.minX
      for (let i = ex.signalStart; i < field.count; i++) {
        const x0 = this.formations[2].pos[i * 3]
        const wrapped = ex.minX + (((x0 - ex.minX + time * 0.7) % span) + span) % span
        pos[i * 3] = lerp(pos[i * 3], wrapped, w2)
      }
      for (const nodes of ex.layerNodes) {
        for (const idx of nodes) {
          scale[idx] *= 1 + 0.16 * Math.sin(time * 2.1 + idx * 1.7) * w2
        }
      }
    }

    /* -- ch3 journey: wave displacement -- */
    const w3 = w(3)
    if (w3 > 0.01) {
      const gridCount = this.formations[3].extras.gridCount
      for (let i = 0; i < field.count; i++) {
        const x = pos[i * 3], z = pos[i * 3 + 2]
        if (i < gridCount || this.formations[3].pos[i * 3 + 1] <= WAVE_BASE_Y + 0.01) {
          const h = waveHeight(x, z, time)
          pos[i * 3 + 1] += h * 1.3 * w3
          scale[i] *= 1 + 0.18 * h * w3
        } else {
          pos[i * 3 + 1] += Math.sin(time * 0.9 + i) * 0.15 * w3
        }
      }
    }

    /* -- ch4 projects: deck scrub (offset from rest pose) -- */
    const w4 = w(4)
    const ci = this._deckCi(holds.scrub[4])
    if (w4 > 0.01) {
      const { panelOf } = this.formations[4].extras
      const panelCount = this.dom.projects.length
      for (let j = 0; j < panelCount; j++) {
        const pose = deckPanelPose(j, ci)
        this._deckPoseCache = this._deckPoseCache || []
        this._deckPoseCache[j] = pose
      }
      for (let i = 0; i < field.count; i++) {
        const p = panelOf[i]
        if (p < 0) continue
        const pose = this._deckPoseCache[p]
        pos[i * 3 + 1] += pose.liftY * w4
        pos[i * 3 + 2] += ci * DECK_SPACING * w4
        scale[i] *= 1 - pose.lift * 0.85 * w4
      }
    }

    /* -- ch6 links: node float -- */
    const w6 = w(6)
    if (w6 > 0.01) {
      const { nodeOf } = this.formations[6].extras
      const count = this.dom.links.length
      const teacher = this.dom.teacherIndex
      this._nodePoses = this._nodePoses || []
      for (let k = 0; k < count; k++) {
        this._nodePoses[k] = graphNodePose(k, count, teacher, time)
      }
      for (let i = 0; i < field.count; i++) {
        const k = nodeOf[i]
        if (k < 0) continue
        const base = graphNodePose(k, count, teacher, 0)
        const cur = this._nodePoses[k]
        pos[i * 3] += (cur.x - base.x) * w6
        pos[i * 3 + 1] += (cur.y - base.y) * w6
        pos[i * 3 + 2] += (cur.z - base.z) * w6
      }
    }

    /* -- ch7 contact: slow rotation of the distant mini server -- */
    const w7 = w(7)
    if (w7 > 0.01) {
      const theta = time * 0.15
      const cos = Math.cos(theta), sin = Math.sin(theta)
      for (let i = 0; i < field.count; i++) {
        const dx = pos[i * 3] - OUTRO_CENTER.x
        const dz = pos[i * 3 + 2] - OUTRO_CENTER.z
        const rx = dx * cos - dz * sin
        const rz = dx * sin + dz * cos
        pos[i * 3] = lerp(pos[i * 3], OUTRO_CENTER.x + rx, w7)
        pos[i * 3 + 2] = lerp(pos[i * 3 + 2], OUTRO_CENTER.z + rz, w7)
      }
    }

    /* cubes materialize out of the dissolving detail server */
    const reveal = smooth((t - 1.0) / 0.6)
    field.commit(reveal)

    /* -- server detail model -- */
    const serverOpacity = 1 - smooth((t - 1.0) / 0.7)
    this.server.group.rotation.y = Math.sin(time * 0.12) * 0.3 + holds.scrub[0] * 0.5
    this.server.group.position.y = Math.sin(time * 0.5) * 0.05
    this.server.update(time, serverOpacity)

    /* -- lines & stars -- */
    this.neuralMat.opacity = w2 * (0.22 + 0.08 * Math.sin(time * 1.3))
    this.neuralLines.visible = w2 > 0.02

    this.graphMat.opacity = w6 * 0.75
    this.graphLines.visible = w6 > 0.02
    if (this.graphLines.visible && this._nodePoses) {
      for (let e = 0; e < this.graphEdges.length; e++) {
        const [a, b] = this.graphEdges[e]
        const pa = this._nodePoses[a]
        const pb = this._nodePoses[b]
        this.graphLinePos[e * 6] = pa.x
        this.graphLinePos[e * 6 + 1] = pa.y
        this.graphLinePos[e * 6 + 2] = pa.z
        this.graphLinePos[e * 6 + 3] = pb.x
        this.graphLinePos[e * 6 + 4] = pb.y
        this.graphLinePos[e * 6 + 5] = pb.z
      }
      this.graphLines.geometry.attributes.position.needsUpdate = true
    }

    this.starMat.opacity = Math.max(0.15, w(5) * 0.8)
    this.stars.rotation.y = time * 0.005

    /* -- fog blend between chapters -- */
    const i0 = Math.min(Math.floor(t), this.keyframes.length - 2)
    const f = clamp01(t - i0)
    const kf = smooth(f)
    this.fog.near = lerp(this.keyframes[i0].fog[0], this.keyframes[i0 + 1].fog[0], kf)
    this.fog.far = lerp(this.keyframes[i0].fog[1], this.keyframes[i0 + 1].fog[1], kf)

    this._updateAnchors(t, holds, time, ci)
  }

  _updateAnchors(t, holds, time, ci) {
    const field = this.field
    const w3s = smooth(field.chapterWeight(3) * 1.3)
    const w4s = smooth(field.chapterWeight(4) * 1.3)
    const w5s = smooth(field.chapterWeight(5) * 1.3)
    const w6s = smooth(field.chapterWeight(6) * 1.3)

    /* journey cards ride the wave right → left */
    const vis3 = holds.vis[3]
    const lanes = JOURNEY_LANES
    this.anchors.journey.forEach((a, i) => {
      const n = this.anchors.journey.length
      const spread = n * 0.55 + 0.45
      const p = clamp01(vis3 * spread - i * 0.55)
      const x = 15 - 30 * p
      const lane = lanes[i % lanes.length]
      const y = WAVE_BASE_Y + waveHeight(x, lane, time) * 1.3 + 1.35
      const edge = smooth((14.2 - Math.abs(x)) / 2.5)
      a.x = x
      a.y = y
      a.z = lane
      a.opacity = w3s * edge
      a.scale = 0.95
    })

    /* project card rides beside its mosaic panel */
    const { bases } = this.formations[4].extras
    const offX = this.lite ? 0 : 3.25
    const offY = this.lite ? -1.85 : -0.1
    this.anchors.projects.forEach((a, j) => {
      const pose = deckPanelPose(j, ci)
      const base = bases[j]
      const frontness = clamp01(1 - Math.abs(pose.d - 0.1) * 2.0)
      a.x = base.x + offX
      a.y = base.y + pose.liftY + offY
      a.z = base.z + ci * DECK_SPACING
      a.opacity = w4s * frontness
      a.scale = this.lite ? 0.82 : 1 - clamp01(pose.d) * 0.08
    })

    /* blog cards fly from behind the camera onto the wall */
    const vis5 = holds.vis[5]
    this.anchors.blog.forEach((a, j) => {
      const q = clamp01(vis5 * 4.2 - j * 0.7)
      const e = easeOutCubic(q)
      const slot = blogSlot(j, this.anchors.blog.length)
      a.x = lerp(a.start.x, slot.x, e) + Math.sin(e * Math.PI) * a.sway
      a.y = lerp(a.start.y, slot.y, e)
      a.z = lerp(a.start.z, slot.z, e)
      a.opacity = w5s * clamp01(q * 4)
      a.scale = 0.85 + 0.15 * e
    })

    /* friend cards hover at graph nodes */
    const count = this.dom.links.length
    this.anchors.links.forEach((a, k) => {
      const pose = (this._nodePoses && this._nodePoses[k]) || graphNodePose(k, count, this.dom.teacherIndex, time)
      if (k === this.dom.teacherIndex) {
        // teacher card hangs below the central node
        a.x = pose.x - 0.2
        a.y = pose.y - 1.35
        a.z = pose.z
      } else {
        a.x = pose.x
        a.y = pose.y + 0.6
        a.z = pose.z
      }
      a.opacity = w6s
      a.scale = 0.95
    })
  }

  /* camera pose at chapter-float t */
  cameraAt(t, holds, time, outPos, outLook) {
    const i0 = Math.min(Math.max(Math.floor(t), 0), this.keyframes.length - 2)
    const f = smooth(clamp01(t - i0))
    const A = this.keyframes[i0]
    const B = this.keyframes[i0 + 1]
    outPos.set(
      lerp(A.pos[0], B.pos[0], f),
      lerp(A.pos[1], B.pos[1], f),
      lerp(A.pos[2], B.pos[2], f)
    )
    outLook.set(
      lerp(A.look[0], B.look[0], f),
      lerp(A.look[1], B.look[1], f),
      lerp(A.look[2], B.look[2], f)
    )

    /* hero: scroll pushes in toward the front panel */
    if (t < 1) {
      const z = easeInOut(holds.scrub[0])
      outPos.lerp(new THREE.Vector3(...HERO_NEAR.pos), z)
      outLook.lerp(new THREE.Vector3(...HERO_NEAR.look), z)
    }

    /* gentle idle drift (reduced in lite mode) */
    const sway = this.lite ? 0.35 : 1
    outPos.x += Math.sin(time * 0.21) * 0.12 * sway
    outPos.y += Math.cos(time * 0.17) * 0.08 * sway
  }
}
