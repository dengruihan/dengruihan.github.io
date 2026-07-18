/* CubeField — the single InstancedMesh that plays every chapter.
   blend(t) stages a per-cube interpolation between the two nearest
   chapter formations with per-cube stagger; story code may then mutate
   the staged buffers (wave displacement, deck scrub, ...); commit()
   writes instance matrices + colors. */
import * as THREE from 'three'
import { mulberry32 } from './formations.js'

function smoothstep(x) {
  x = Math.min(1, Math.max(0, x))
  return x * x * (3 - 2 * x)
}

export class CubeField {
  constructor(scene, formations, seed = 7) {
    this.formations = formations
    this.count = formations[0].scale.length

    const rng = mulberry32(seed * 101 + 13)
    this.stagger = new Float32Array(this.count)
    for (let i = 0; i < this.count; i++) this.stagger[i] = rng()

    // staged (mutable) buffers the story layer can animate
    this.scratch = {
      pos: new Float32Array(this.count * 3),
      color: new Float32Array(this.count * 3),
      scale: new Float32Array(this.count),
    }

    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false, fog: true })
    this.mesh = new THREE.InstancedMesh(geo, mat, this.count)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    for (let i = 0; i < this.count; i++) this.mesh.setColorAt(i, new THREE.Color(1, 1, 1))
    scene.add(this.mesh)

    this._dummy = new THREE.Object3D()
    this._color = new THREE.Color()
    this.t = 0
  }

  /* stage buffers at chapter-float t (0 .. formations.length-1) */
  blend(t) {
    this.t = t
    const last = this.formations.length - 1
    const i0 = Math.min(Math.max(Math.floor(t), 0), last - 1)
    const i1 = i0 + 1
    const f = Math.min(Math.max(t - i0, 0), 1)
    const A = this.formations[i0]
    const B = this.formations[i1]
    const { pos, color, scale } = this.scratch

    for (let i = 0; i < this.count; i++) {
      // staggered local progress: cubes don't all depart/arrive at once
      const fi = smoothstep((f * 1.5 - this.stagger[i] * 0.5) / 1.0)
      const i3 = i * 3
      pos[i3] = A.pos[i3] + (B.pos[i3] - A.pos[i3]) * fi
      pos[i3 + 1] = A.pos[i3 + 1] + (B.pos[i3 + 1] - A.pos[i3 + 1]) * fi
      pos[i3 + 2] = A.pos[i3 + 2] + (B.pos[i3 + 2] - A.pos[i3 + 2]) * fi
      color[i3] = A.color[i3] + (B.color[i3] - A.color[i3]) * fi
      color[i3 + 1] = A.color[i3 + 1] + (B.color[i3 + 1] - A.color[i3 + 1]) * fi
      color[i3 + 2] = A.color[i3 + 2] + (B.color[i3 + 2] - A.color[i3 + 2]) * fi
      scale[i] = A.scale[i] + (B.scale[i] - A.scale[i]) * fi
    }
    this.fromIndex = i0
    this.frac = f
  }

  /* weight of chapter k in the current blend (1 when fully there) */
  chapterWeight(k) {
    return Math.min(Math.max(1 - Math.abs(this.t - k), 0), 1)
  }

  commit(globalScale = 1) {
    const { pos, color, scale } = this.scratch
    const d = this._dummy
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      const s = scale[i] * globalScale
      d.position.set(pos[i3], pos[i3 + 1], pos[i3 + 2])
      d.scale.setScalar(Math.max(s, 0.0001))
      d.rotation.set(0, 0, 0)
      d.updateMatrix()
      this.mesh.setMatrixAt(i, d.matrix)
      this._color.setRGB(color[i3], color[i3 + 1], color[i3 + 2])
      this.mesh.setColorAt(i, this._color)
    }
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}
