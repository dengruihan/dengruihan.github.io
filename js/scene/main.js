/* Scene entry — capability gates, then lazy-load the WebGL layer.
   Falls back silently to the classic 2D page whenever anything is missing. */
import { narrowMQ, coarseMQ } from '../viewport.js'

;(function bootScene() {
  // tell the boot loader once that no 3D is coming (never more than once)
  let skipSent = false
  function skipScene() {
    if (skipSent) return
    skipSent = true
    document.dispatchEvent(new CustomEvent('scene:skipped'))
  }

  // respect reduced-motion: the classic page already handles it
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipScene()
    return
  }

  // WebGL probe
  const probe = document.createElement('canvas')
  const gl = probe.getContext('webgl2') || probe.getContext('webgl')
  if (!gl) {
    skipScene()
    return
  }

  // lite = power tier, judged once at boot: small touch device, narrow
  // screen, or low memory. A desktop with a touchscreen (pointer: coarse
  // alone) still gets the full scene. Width-driven LAYOUT decisions are
  // not here — they re-evaluate live via js/viewport.js.
  const coarseNarrow = coarseMQ.matches && window.innerWidth < 1024
  const lite =
    coarseNarrow || narrowMQ.matches || (navigator.deviceMemory && navigator.deviceMemory <= 2)

  let started = false
  let controller = null
  let rebuilt = false

  function fallback2d() {
    document.documentElement.classList.remove('scene-3d', 'scene-lite')
    skipScene()
  }

  async function start() {
    if (started) return
    started = true
    const root = document.documentElement
    root.classList.add('scene-3d')
    if (lite) root.classList.add('scene-lite')

    const boot = async () => {
      const { startScene } = await import('./engine.js')
      controller = startScene({
        lite,
        onContextLost() {
          // tear down, then try one clean rebuild (keeps scroll position);
          // if that fails, fall back to the classic 2D page
          controller?.destroy()
          controller = null
          if (rebuilt) {
            fallback2d()
            return
          }
          rebuilt = true
          setTimeout(async () => {
            try {
              await boot()
            } catch (err) {
              console.error('3D scene rebuild failed:', err)
              fallback2d()
            }
          }, 800)
        },
      })
    }

    try {
      await boot()
    } catch (err) {
      fallback2d()
      console.error('3D scene failed to start:', err)
    }
  }

  if (window.__siteRendered) start()
  else window.addEventListener('site:rendered', start, { once: true })
})()
