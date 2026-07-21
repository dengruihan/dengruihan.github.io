/* OverlaySystem — keeps real HTML cards glued to 3D anchors.
   Cards are clones of the server-rendered DOM (buttons/links stay
   semantic and clickable); the originals are hidden by CSS in 3D mode.
   Each registered card supplies getState() → { x, y, z, opacity, scale }
   in world space; sync() projects once per frame after the camera moves. */
import * as THREE from 'three'
import { isNarrow } from '../viewport.js'

export class OverlaySystem {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'scene-overlays'
    document.body.appendChild(this.container)
    this.items = []
    this._v = new THREE.Vector3()
    this._camDir = new THREE.Vector3()
    this._toAnchor = new THREE.Vector3()
  }

  /**
   * @param {Element} sourceEl element rendered by js/main.js (kept as click/keyboard proxy)
   * @param {() => {x:number,y:number,z:number,opacity:number,scale?:number}} getState
   * @param {string} className extra scene-card modifier class
   */
  add(sourceEl, getState, className) {
    const el = sourceEl.cloneNode(true)
    el.classList.add('scene-card')
    if (className) el.classList.add(className)
    el.removeAttribute('id')
    // clicks on non-interactive areas proxy to the original element so the
    // existing delegation handlers (blog overlay etc.) keep working
    el.addEventListener('click', (e) => {
      if (e.target.closest('a, button') && el.tagName !== 'BUTTON') return
      if (el.tagName === 'BUTTON') {
        e.preventDefault()
        sourceEl.click()
      }
    })
    this.container.appendChild(el)
    this.items.push({ el, getState })
    return el
  }

  sync(camera, t) {
    camera.getWorldDirection(this._camDir)
    const w = window.innerWidth
    const h = window.innerHeight
    // narrow viewport: keep cards inside the frame instead of clipping
    // (live check — follows resize/orientation, not latched at boot)
    const clamp = isNarrow()
    for (const { el, getState } of this.items) {
      const s = getState(t)
      if (!s || s.opacity <= 0.01) {
        if (el.style.visibility !== 'hidden') {
          el.style.visibility = 'hidden'
          el.style.opacity = '0'
        }
        continue
      }
      this._toAnchor.set(s.x, s.y, s.z).sub(camera.position)
      const facing = this._toAnchor.dot(this._camDir)
      if (facing <= 0.1) {
        el.style.visibility = 'hidden'
        el.style.opacity = '0'
        continue
      }
      this._v.set(s.x, s.y, s.z).project(camera)
      let px = (this._v.x * 0.5 + 0.5) * w
      let py = (-this._v.y * 0.5 + 0.5) * h
      if (clamp) {
        px = Math.min(Math.max(px, w * 0.08), w * 0.92)
        py = Math.min(Math.max(py, h * 0.07), h * 0.88)
      }
      const scale = s.scale ?? 1
      el.style.visibility = 'visible'
      el.style.opacity = s.opacity.toFixed(3)
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
    }
  }

  destroy() {
    this.container.remove()
    this.items = []
  }
}
