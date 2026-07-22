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
  BLOG_WALL_Z,
  graphNodePose,
  OUTRO_CENTER,
  mulberry32,
} from './formations.js'
import { isNarrow } from '../viewport.js'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => {
  x = clamp01(x)
  return x * x * (3 - 2 * x)
}
const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const lerp = (a, b, k) => a + (b - a) * k

/* camera + fog keyframes per chapter */
const KEYFRAMES = [
  { pos: [0, 0.55, 7.6], look: [0, 0.3, 0], fog: [10, 30] }, // 0 hero (server squared up front)
  { pos: [-3.8, 3.6, 6.1], look: [0, 0.6, 0], fog: [10, 30] }, // 1 about (orbit start: upper-left)
  { pos: [2.0, 1.9, 11.0], look: [-0.9, 0.45, 0], fog: [9, 28] }, // 2 skills (front-right: layer stack lies diagonal, bands stay separate)
  { pos: [8.2, 6.4, -6.2], look: [0, -0.2, 0], fog: [11, 34] }, // 3 journey (back-right-top)
  { pos: [0.2, 0.8, 10.2], look: [0.2, 0.4, -2.5], fog: [8, 26] }, // 4 projects
  { pos: [0, 1.5, 8.6], look: [0, 0.9, -10.5], fog: [6, 30] }, // 5 blog (deep space)
  { pos: [0, 2.2, 11.6], look: [0, 0.95, 0], fog: [9, 28] }, // 6 links
  { pos: [0, 1.6, 9.6], look: [0, 0.2, -8], fog: [8, 26] }, // 7 contact
]

/* portrait framing: how strongly each chapter's camera pulls back along
   its view axis as the aspect ratio narrows (wide chapters need the most;
   hero is untouched — it's already a centered close-up) */
const PULLBACK = [0, 0.3, 0.5, 1, 0.6, 1, 1, 0.5]


export class Story {
  constructor({ scene, camera, cubeField, formations, server, overlays, dom, lite }) {
    this.scene = scene
    this.camera = camera
    this.field = cubeField
    this.formations = formations
    this.server = server
    this.overlays = overlays
    this.dom = dom
    this.lite = lite

    this.fog = new THREE.Fog(COLORS.ink, 10, 30)
    scene.fog = this.fog

    // portrait screens see a narrower slice of the world — the camera
    // pulls back dynamically in cameraAt() via PULLBACK + _aspectPull(),
    // so framing follows the live aspect ratio instead of boot-time lite
    this.keyframes = KEYFRAMES.map((k) => ({ pos: [...k.pos], look: [...k.look], fog: [...k.fog] }))
    this.viewport = {
      aspect: window.innerWidth / window.innerHeight,
      narrow: isNarrow(),
    }

    this._buildStars()
    this._buildNeuralLines()
    this._buildGraphLines()
    this._buildAnchors()
    this._registerOverlays()
  }

  /* engine pushes live viewport state on every resize/orientation change */
  setViewport({ aspect, narrow }) {
    this.viewport.aspect = aspect
    this.viewport.narrow = narrow
  }

  /* 0 in landscape, up to ~0.8 on a tall phone — scales the PULLBACK
     weights so the framing widens exactly as much as the crop demands */
  _aspectPull() {
    return clamp01((0.8 - this.viewport.aspect) / 0.8) * 0.8
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

  /* deck scrub: continuous card index with dwell at each integer —
     half of each panel's scroll is reading time; during the transition
     the mosaic+card pair flies up and out together */
  _deckCi(scrub) {
    const count = this.dom.projects.length
    const raw = clamp01(scrub) * (count - 1)
    const step = Math.floor(raw)
    const frac = raw - step
    const e = smooth((frac - 0.25) / 0.5)
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

    /* -- ch4 projects: deck scrub (offset from rest pose) — gated to
          the chapter focus so panels only move once the field is in
          place and the user has fully arrived -- */
    const w4 = w(4)
    const ci = this._deckCi(holds.deck)
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
        scale[i] *= 1 - pose.lift * 0.25 * w4 // mostly intact while flying out
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

    /* cubes materialize out of the dissolving detail server — starts only
       after the Field Notes content has had its reading time */
    const reveal = smooth((t - 1.45) / 0.5)
    field.commit(reveal)

    /* -- server detail model -- held square for the hero, tips only as it
          dissolves into the cube field on scroll -- */
    const serverOpacity = 1 - smooth((t - 1.45) / 0.55)
    this.server.group.rotation.y = holds.scrub[0] * 0.5
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

    /* -- fog blend between chapters (follows the held chapter clock) -- */
    const ft = holds.ft ?? t
    const i0 = Math.min(Math.floor(ft), this.keyframes.length - 2)
    const f = clamp01(ft - i0)
    const kf = smooth(f)
    this.fog.near = lerp(this.keyframes[i0].fog[0], this.keyframes[i0 + 1].fog[0], kf)
    this.fog.far = lerp(this.keyframes[i0].fog[1], this.keyframes[i0 + 1].fog[1], kf)

    this._updateAnchors(t, holds, time, ci)
  }

  _updateAnchors(t, holds, time, ci) {
    const field = this.field
    const w4s = smooth(field.chapterWeight(4) * 1.3)
    const w5s = smooth(field.chapterWeight(5) * 1.3)
    const w6s = smooth(field.chapterWeight(6) * 1.3)

    /* journey cards travel one by one from the lower-left corner to the
       upper-right, through screen center, bobbing gently with the wave.
       Driven by the chapter float (not section visibility) and anchored
       in CAMERA space: the camera is flying toward the projects pose for
       most of the window, so a world-space path would drift out of frame.
       The show opens only once the wave has fully assembled (t≥3) and
       the last card exits just before the projects card fades in. */
    const show = clamp01((t - 3.05) / 0.8)
    const camP = this._camP || (this._camP = new THREE.Vector3())
    const camL = this._camL || (this._camL = new THREE.Vector3())
    const fwd = this._fwd || (this._fwd = new THREE.Vector3())
    const right = this._right || (this._right = new THREE.Vector3())
    const upv = this._upv || (this._upv = new THREE.Vector3())
    const up = this._up || (this._up = new THREE.Vector3(0, 1, 0))
    this.cameraAt(holds.ft ?? t, holds, time, camP, camL)
    fwd.subVectors(camL, camP)
    const depth = fwd.length()
    fwd.normalize()
    right.crossVectors(fwd, up).normalize()
    upv.crossVectors(right, fwd)
    // frustum half-extents at the look depth; the diagonal path runs
    // corner-to-corner slightly beyond the frame. Narrow screens get a
    // tighter margin — halfW is already small there, and the wide 2.2
    // overshoot would make cards flash across the visible strip
    const halfH = depth * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const halfW = halfH * this.camera.aspect
    const uMax = halfW + (this.viewport.narrow ? 1.0 : 2.2)
    const vSpan = halfH + (this.viewport.narrow ? 0.8 : 1.5)
    this.anchors.journey.forEach((a, i) => {
      const n = this.anchors.journey.length
      const spread = n * 0.55 + 0.45
      const p = clamp01(show * spread - i * 0.55)
      const u = -uMax + 2 * uMax * p
      const v = -vSpan + 2 * vSpan * p + waveHeight(u, 0, time) * 0.35
      a.x = camP.x + fwd.x * depth + right.x * u + upv.x * v
      a.y = camP.y + fwd.y * depth + right.y * u + upv.y * v
      a.z = camP.z + fwd.z * depth + right.z * u + upv.z * v
      a.opacity = smooth((p - 0.02) / 0.12) * (1 - smooth((p - 0.86) / 0.12))
      a.scale = 0.95
    })

    /* project card rides beside its mosaic panel — held back until the
       last journey card has exited, so the two shows hand off instead
       of overlapping center stage */
    const w4Gate = smooth((t - 3.75) / 0.25)
    const { bases } = this.formations[4].extras
    // narrow screens: card rides below its mosaic panel — 3.25 world
    // units to the right would be off-frame in portrait
    const offX = this.viewport.narrow ? 0 : 3.25
    const offY = this.viewport.narrow ? -1.85 : -0.1
    this.anchors.projects.forEach((a, j) => {
      const pose = deckPanelPose(j, ci)
      const base = bases[j]
      /* incoming fades in as it's revealed; outgoing rides the same
         liftY as its mosaic (flying off the top together) and only
         fades at the very end of the flight */
      const frontness =
        pose.d >= 0
          ? 0.8 * clamp01((0.85 - pose.d) * 1.5)
          : 0.8 * clamp01(1 - Math.max(0, -pose.d - 0.55) * 2.5)
      a.x = base.x + offX
      a.y = base.y + pose.liftY + offY
      a.z = base.z + ci * DECK_SPACING
      a.opacity = w4s * w4Gate * frontness
      a.scale = this.viewport.narrow ? 0.82 : 1 - clamp01(pose.d) * 0.08
    })

    /* blog cards fly from behind the camera onto the wall — a horizontal
       row on wide screens, a vertical column on narrow ones (the row's
       ±5.6-unit spread is off-frame in portrait). The column needs wide
       spacing + a smaller card scale: overlay cards are fixed pixel size,
       so three of them only fit the tall axis with room to spare */
    const vis5 = holds.vis[5]
    const blogCount = this.anchors.blog.length
    const narrow = this.viewport.narrow
    this.anchors.blog.forEach((a, j) => {
      const q = clamp01(vis5 * 4.2 - j * 0.7)
      const e = easeOutCubic(q)
      const slot = narrow
        ? { x: 0, y: 0.95 - (j - (blogCount - 1) / 2) * 6.2, z: BLOG_WALL_Z + 0.4 }
        : blogSlot(j, blogCount)
      a.x = lerp(a.start.x, slot.x, e) + Math.sin(e * Math.PI) * a.sway
      a.y = lerp(a.start.y, slot.y, e)
      a.z = lerp(a.start.z, slot.z, e)
      a.opacity = w5s * clamp01(q * 4)
      a.scale = narrow ? 0.55 + 0.1 * e : 0.85 + 0.15 * e
    })

    /* friend cards hover at graph nodes — except on narrow screens, where
       the compressed graph packs the nodes closer than the fixed-pixel
       cards; there they stack in a clear vertical column instead */
    const count = this.dom.links.length
    this.anchors.links.forEach((a, k) => {
      if (this.viewport.narrow) {
        a.x = 0
        a.y = 0.95 - (k - (count - 1) / 2) * 3.1
        a.z = 0
        a.opacity = w6s
        a.scale = 0.9
        return
      }
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

  /* camera pose at chapter-float t — engine passes the remapped clock
     (holds.ft): held at the journey/projects beats while their shows
     play, so no camera movement happens mid-show */
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

    /* portrait framing: push the camera away from its look target along
       the view axis, weighted per chapter — follows the live aspect, so
       window resizes and rotations re-frame smoothly */
    const pull = this._aspectPull()
    if (pull > 0) {
      const wPull = lerp(PULLBACK[i0], PULLBACK[i0 + 1], f) * pull
      if (wPull > 0.001) {
        outPos.sub(outLook).multiplyScalar(1 + wPull).add(outLook)
      }
    }

    /* hero → Capabilities: one continuous three-beat move —
       1. first scroll: push in toward the server while swinging up-left,
          settling on a 45° side angle and holding it there
       2. Field Notes: descend along the held angle while the chassis
          dissolves into the cube field
       3. run-up to Capabilities: a slow rightward arc that lands exactly
          on the skills keyframe, where the base track takes over */
    if (t < 2.0) {
      const k0 = this.keyframes[0]
      const k2 = this.keyframes[2]
      const push = smooth(t / 0.75) //           beat 1: dolly in + swing up-left
      const down = smooth((t - 0.9) / 0.7) //      beat 2: Field Notes descent
      const right = smooth((t - 1.5) / 0.48) //    beat 3: slow arc onto Capabilities
      // portrait widens the arc once the camera leaves the hero close-up
      const widen = 1 + this._aspectPull() * 0.3 * push

      const az = lerp(
        lerp(Math.atan2(k0.pos[0], k0.pos[2]), -Math.PI / 4, push),
        Math.atan2(k2.pos[0], k2.pos[2]),
        right
      )
      const radius =
        lerp(
          lerp(lerp(Math.hypot(k0.pos[0], k0.pos[2]), 5.0, push), 7.3, down),
          Math.hypot(k2.pos[0], k2.pos[2]),
          right
        ) * widen
      const y = lerp(lerp(lerp(k0.pos[1], 3.2, push), 1.05, down), k2.pos[1], right)

      const w = 1 - smooth((t - 1.9) / 0.1)
      if (w > 0.001) {
        outPos.lerp(new THREE.Vector3(Math.sin(az) * radius, y, Math.cos(az) * radius), w)
        outLook.lerp(
          new THREE.Vector3(
            lerp(k0.look[0], k2.look[0], right),
            lerp(lerp(lerp(k0.look[1], 0.7, push), 0.15, down), k2.look[1], right),
            lerp(k0.look[2], k2.look[2], right)
          ),
          w
        )
      }
    }

    /* gentle idle drift (reduced in lite mode) */
    const sway = this.lite ? 0.35 : 1
    outPos.x += Math.sin(time * 0.21) * 0.12 * sway
    outPos.y += Math.cos(time * 0.17) * 0.08 * sway
  }
}
