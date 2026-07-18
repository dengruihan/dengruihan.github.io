/* Hero detail server — a procedural rack unit for the close-up shots.
   Visible during chapters 0-1; dissolves (fades) as the cube field
   explodes out of the same silhouette. */
import * as THREE from 'three'
import { COLORS, CSS_COLORS } from './palette.js'
import { mulberry32 } from './formations.js'

function makeLabelTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0d1a13'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = '500 34px "IBM Plex Mono", monospace'
  ctx.fillStyle = CSS_COLORS.reed
  ctx.fillText('SURVEY UNIT RD-01', 22, 44)
  ctx.font = '400 22px "IBM Plex Mono", monospace'
  ctx.fillStyle = CSS_COLORS.egg
  ctx.fillText('FIELD FEED · WETLAND SURVEY', 22, 76)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function buildServerModel() {
  const rng = mulberry32(42)
  const group = new THREE.Group()
  const fadeMaterials = []

  const mat = (params) => {
    const m = new THREE.MeshStandardMaterial({ transparent: true, ...params })
    fadeMaterials.push(m)
    return m
  }

  const chassisMat = mat({ color: 0x1e3529, metalness: 0.5, roughness: 0.55 })
  const darkMat = mat({ color: 0x0d1a13, metalness: 0.3, roughness: 0.8 })
  const bayMat = mat({ color: 0x2a4a3a, metalness: 0.4, roughness: 0.55 })
  const handleMat = mat({ color: 0x0a1410, metalness: 0.2, roughness: 0.9 })

  // chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 1.4), chassisMat)
  group.add(chassis)

  // recessed front panel
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 0.06), darkMat)
  panel.position.set(0, 0, 0.72)
  group.add(panel)

  // drive bays: 2 cols x 7 rows
  const bayGeo = new THREE.BoxGeometry(0.92, 0.3, 0.05)
  const handleGeo = new THREE.BoxGeometry(0.18, 0.05, 0.03)
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 2; c++) {
      const bay = new THREE.Mesh(bayGeo, bayMat)
      bay.position.set((c - 0.5) * 1.02, 1.25 - r * 0.38, 0.76)
      group.add(bay)
      const handle = new THREE.Mesh(handleGeo, handleMat)
      handle.position.set((c - 0.5) * 1.02 + 0.3, 1.25 - r * 0.38, 0.8)
      group.add(handle)
    }
  }

  // status LEDs — emissive, pulsed in update()
  const ledColors = [COLORS.egg, COLORS.signal, 0x7ddba3]
  const leds = []
  const ledGeo = new THREE.BoxGeometry(0.045, 0.045, 0.02)
  for (let i = 0; i < 16; i++) {
    const color = ledColors[Math.floor(rng() * ledColors.length)]
    const ledMat = new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true })
    fadeMaterials.push(ledMat)
    const led = new THREE.Mesh(ledGeo, ledMat)
    led.position.set(-0.95 + (i % 8) * 0.12, -1.52 + Math.floor(i / 8) * 0.12, 0.76)
    led.userData.phase = rng() * Math.PI * 2
    led.userData.speed = 1.5 + rng() * 3
    group.add(led)
    leds.push(led)
  }

  // vent grille along the bottom
  const ventGeo = new THREE.BoxGeometry(2.0, 0.025, 0.02)
  for (let i = 0; i < 6; i++) {
    const vent = new THREE.Mesh(ventGeo, handleMat)
    vent.position.set(0, -1.18 + i * 0.09, 0.76)
    group.add(vent)
  }

  // brand plate with canvas label
  const labelMat = new THREE.MeshBasicMaterial({ map: makeLabelTexture(), transparent: true, toneMapped: false })
  fadeMaterials.push(labelMat)
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), labelMat)
  label.position.set(0, 1.52, 0.755)
  group.add(label)

  // top antenna + beacon
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), darkMat)
  antenna.position.set(0.9, 1.95, 0)
  group.add(antenna)
  const beaconMat = new THREE.MeshBasicMaterial({ color: COLORS.egg, toneMapped: false, transparent: true })
  fadeMaterials.push(beaconMat)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), beaconMat)
  beacon.position.set(0.9, 2.22, 0)
  group.add(beacon)

  const state = { group, leds, beacon }

  state.update = (time, opacity) => {
    for (const m of fadeMaterials) m.opacity = opacity
    group.visible = opacity > 0.01
    if (!group.visible) return
    for (const led of leds) {
      const glow = 0.35 + 0.65 * Math.max(0, Math.sin(time * led.userData.speed + led.userData.phase))
      led.material.opacity = glow * opacity
    }
    beacon.material.opacity = (0.4 + 0.6 * Math.max(0, Math.sin(time * 2.4))) * opacity
    const s = 1 + Math.sin(time * 2.4) * 0.12
    beacon.scale.setScalar(s)
  }

  return state
}
