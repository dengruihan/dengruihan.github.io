/* Engine — renderer, smoothed native-scroll driver, section metrics,
   main loop, resize / visibility / context-loss handling. */
import * as THREE from 'three'
import { COLORS } from './palette.js'
import { buildAllFormations, setGraphScale } from './formations.js'
import { CubeField } from './morph.js'
import { buildServerModel } from './server-model.js'
import { OverlaySystem } from './overlays.js'
import { Story, fieldClock } from './story.js'

const CHAPTER_IDS = ['hero', 'about', 'skills', 'journey', 'projects', 'blog', 'links', 'contact']
const CHAPTER_COUNT = CHAPTER_IDS.length

function collectDom() {
  const journey = [...document.querySelectorAll('#timeline-list .timeline-card')]
  const projects = [...document.querySelectorAll('#projects-track .project-panel')]
  const blog = [...document.querySelectorAll('#blog-grid .blog-card')]
  const links = [...document.querySelectorAll('#friend-links-root .friend-link-card')]
  let teacherIndex = links.findIndex(
    (el) => el.querySelector('.friend-link-role')?.textContent.trim() === '老师'
  )
  if (teacherIndex < 0) teacherIndex = links.length - 1
  return { journey, projects, blog, links, teacherIndex }
}

export function startScene({ lite = false, onContextLost } = {}) {
  const rootEl = document.documentElement

  /* ---------- renderer ---------- */
  const canvas = document.createElement('canvas')
  canvas.className = 'scene-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.prepend(canvas)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lite,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(COLORS.ink)

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120)

  /* lights (only the hero server model uses lit materials) */
  scene.add(new THREE.AmbientLight(COLORS.reed, 0.65))
  const key = new THREE.PointLight(COLORS.egg, 26, 30)
  key.position.set(4, 3, 4)
  scene.add(key)
  const rim = new THREE.PointLight(COLORS.signal, 14, 26)
  rim.position.set(-5, 2, -3)
  scene.add(rim)
  const fill = new THREE.PointLight(COLORS.mist, 13, 24)
  fill.position.set(0, 1, 7)
  scene.add(fill)

  /* ---------- content ---------- */
  const dom = collectDom()
  setGraphScale(lite ? 0.55 : 1)
  const N = lite ? 380 : 1000
  const formations = buildAllFormations(N, 2026, {
    projects: Math.max(dom.projects.length, 1),
    blog: Math.max(dom.blog.length, 1),
    links: Math.max(dom.links.length, 1),
    teacherIndex: dom.teacherIndex,
  })
  const cubeField = new CubeField(scene, formations)
  const server = buildServerModel()
  scene.add(server.group)
  const overlays = new OverlaySystem()
  const story = new Story({ scene, camera, cubeField, formations, server, overlays, dom, lite })

  /* ---------- section metrics ---------- */
  const projectsZone = document.getElementById('projects-scroll-zone')
  let metrics = []

  function setProjectsHeight() {
    if (projectsZone) {
      const perCard = lite ? 1.15 : 1.35
      const h = Math.ceil(window.innerHeight * (1 + dom.projects.length * perCard))
      projectsZone.style.setProperty('--projects-scroll-h', `${h}px`)
    }
  }

  function measure() {
    setProjectsHeight()
    const vh = window.innerHeight
    metrics = CHAPTER_IDS.map((id) => {
      const el = id === 'projects' && projectsZone ? projectsZone : document.getElementById(id)
      if (!el) return { top: 0, height: vh, focus: 0 }
      const top = el.getBoundingClientRect().top + window.scrollY
      const height = el.offsetHeight
      return { top, height, focus: top + height / 2 - vh / 2 }
    })
  }

  function chapterAt(sY) {
    if (sY <= metrics[0].focus) return 0
    for (let i = 0; i < CHAPTER_COUNT - 1; i++) {
      const a = metrics[i].focus
      const b = metrics[i + 1].focus
      if (sY < b) return i + Math.min(Math.max((sY - a) / Math.max(b - a, 1), 0), 1)
    }
    return CHAPTER_COUNT - 1
  }

  function holdsAt(sY) {
    const vh = window.innerHeight
    const scrub = new Array(CHAPTER_COUNT)
    const vis = new Array(CHAPTER_COUNT)
    for (let i = 0; i < CHAPTER_COUNT; i++) {
      const m = metrics[i]
      scrub[i] = Math.min(Math.max((sY - m.top) / Math.max(m.height - vh, vh * 0.55), 0), 1)
      vis[i] = Math.min(Math.max((sY + vh - m.top) / (m.height + vh), 0), 1)
    }
    /* deck scrub starts only once the user has fully arrived at the
       projects chapter (sY ≥ focus, field assembled at t=4) — before
       that the panels hold their rest pose while the cubes fly in */
    const m4 = metrics[4]
    const zoneEnd = m4.top + m4.height - vh
    const deck = Math.min(Math.max((sY - m4.focus) / Math.max(zoneEnd - m4.focus, 1), 0), 1)
    return { scrub, vis, deck }
  }

  /* ---------- loop ---------- */
  const camPos = new THREE.Vector3()
  const camLook = new THREE.Vector3()
  let smoothScroll = window.scrollY
  let running = true
  let rafId = 0
  let last = performance.now()
  let debugEl = null
  let frames = 0
  let fpsTime = 0
  let firstFrameSent = false

  if (new URLSearchParams(location.search).has('scene-debug')) {
    debugEl = document.createElement('div')
    debugEl.className = 'scene-debug'
    document.body.appendChild(debugEl)
  }

  function frame(now) {
    if (!running) return
    rafId = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const time = now / 1000

    // critically-damped-enough smoothing of native scroll
    const target = window.scrollY
    smoothScroll += (target - smoothScroll) * (1 - Math.exp(-dt * 5.5))
    if (Math.abs(target - smoothScroll) < 0.01) smoothScroll = target

    const t = chapterAt(smoothScroll)
    const holds = holdsAt(smoothScroll)

    // the projects pin (Deployments title) enters only as the wave
    // starts morphing into the deck — not a pixel before
    const enterRaw = Math.min(Math.max((t - 3.85) / 0.13, 0), 1)
    rootEl.style.setProperty('--projects-enter', (enterRaw * enterRaw * (3 - 2 * enterRaw)).toFixed(3))

    cubeField.blend(fieldClock(t))
    story.update(t, holds, time)
    story.cameraAt(t, holds, time, camPos, camLook)
    camera.position.copy(camPos)
    camera.lookAt(camLook)
    overlays.sync(camera, t)

    renderer.render(scene, camera)

    // boot loader waits for this — the scene is visibly on screen now
    if (!firstFrameSent) {
      firstFrameSent = true
      document.dispatchEvent(new CustomEvent('scene:ready'))
    }

    if (debugEl) {
      frames++
      fpsTime += dt
      if (fpsTime >= 0.5) {
        debugEl.textContent = `t=${t.toFixed(2)} fps=${Math.round(frames / fpsTime)} scroll=${Math.round(smoothScroll)}`
        frames = 0
        fpsTime = 0
      }
    }
  }

  /* ---------- events ---------- */
  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.fov = w / h < 0.8 ? 55 : 42
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    measure()
  }

  function onVisibility() {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(rafId)
    } else if (!running) {
      running = true
      last = performance.now()
      rafId = requestAnimationFrame(frame)
    }
  }

  function onLost(e) {
    e.preventDefault()
    running = false
    cancelAnimationFrame(rafId)
    // three cannot recover GPU state on the same context; the caller tears
    // this instance down and rebuilds (or falls back to 2D)
    onContextLost?.()
  }

  window.addEventListener('resize', onResize)
  window.addEventListener('load', measure)
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onLost)

  /* ---------- go ---------- */
  measure()
  onResize()
  rafId = requestAnimationFrame(frame)

  // debug: ?scene-goto=1.25 parks the scroll driver at a chapter-float
  // position (pairs with ?scene-debug for the t readout)
  const gotoT = parseFloat(new URLSearchParams(location.search).get('scene-goto') || '')
  if (!Number.isNaN(gotoT)) {
    const jump = () => {
      const i = Math.min(Math.max(Math.floor(gotoT), 0), CHAPTER_COUNT - 2)
      const frac = Math.min(Math.max(gotoT - i, 0), 1)
      const a = metrics[i] ? metrics[i].focus : 0
      const b = metrics[i + 1] ? metrics[i + 1].focus : a
      const y = a + (b - a) * frac
      smoothScroll = y
      window.scrollTo(0, y)
    }
    setTimeout(jump, 250)
    window.addEventListener('load', () => setTimeout(jump, 350))
  }

  // debug/testing handle
  if (debugEl) {
    window.__scene = {
      chapter: () => chapterAt(smoothScroll),
      metrics: () => metrics.map((m) => ({ ...m })),
      holds: () => holdsAt(smoothScroll),
      anchors: () => JSON.parse(JSON.stringify(story.anchors)),
      cam: () => [...camera.position.toArray(), ...camLook.toArray()],
      // live-edit a camera keyframe: __scene.kf(2, [x,y,z], [lx,ly,lz])
      // call with just an index to read the current values
      kf: (i, pos, look) => {
        if (pos) story.keyframes[i].pos = [...pos]
        if (look) story.keyframes[i].look = [...look]
        return {
          pos: [...story.keyframes[i].pos],
          look: [...story.keyframes[i].look],
        }
      },
      lite,
    }
  }

  return {
    destroy() {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', measure)
      document.removeEventListener('visibilitychange', onVisibility)
      overlays.destroy()
      renderer.dispose()
      canvas.remove()
    },
  }
}
