import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let riverPath = null
let riverClipRect = null
const RIVER_VIEW_HEIGHT = 2000

function setupLenisScrollTrigger(instance) {
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        instance.scrollTo(value, { immediate: true })
      }
      return instance.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
  })

  ScrollTrigger.addEventListener('refresh', () => instance.resize())
}

export function initAnimations() {
  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  })

  setupRiverThread()
  setupLenisScrollTrigger(lenis)

  lenis.on('scroll', (instance) => {
    ScrollTrigger.update()
    updateRiverProgress(instance.progress)
  })

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  initHero()
  initAbout()
  initSkills()
  initJourney()
  initProjects()
  initBlog()
  initUpdates()

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    if (lenis) {
      updateRiverProgress(lenis.progress)
    }
  })
}

function setupRiverThread() {
  riverPath = document.querySelector('.river-path')
  riverClipRect = document.querySelector('#river-clip-rect')
  if (!riverPath || !riverClipRect) return

  riverClipRect.setAttribute('height', '0')
}

function updateRiverProgress(progress) {
  if (!riverPath || !riverClipRect) return
  const clamped = Math.max(0, Math.min(1, progress))
  riverClipRect.setAttribute('height', String(RIVER_VIEW_HEIGHT * clamped))
}

function initHero() {
  const words = document.querySelectorAll('.hero-word')
  const tagline = document.querySelector('.hero-tagline')
  const bio = document.querySelector('.hero-bio')
  const actions = document.querySelector('.hero-actions')
  const cue = document.querySelector('.scroll-cue')

  gsap.set(words, { opacity: 0, y: 40 })
  gsap.set([tagline, bio, actions, cue], { opacity: 0, y: 20 })

  const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  loadTl
    .to(words, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 })
    .to(tagline, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to(bio, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to(actions, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to(cue, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
}

function initAbout() {
  const section = document.querySelector('.section-about')
  const avatar = document.querySelector('.about-avatar')
  const lines = document.querySelectorAll('.story-line-inner')
  const facts = document.querySelectorAll('.fact-item')
  const goals = document.querySelectorAll('.goal-card')

  gsap.to(avatar, {
    y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })

  gsap.to(lines, {
    y: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about-story',
      start: 'top 80%',
    },
  })

  gsap.to(facts, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-facts',
      start: 'top 85%',
    },
  })

  gsap.to(goals, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.goals-grid',
      start: 'top 80%',
    },
  })
}

function initSkills() {
  const section = document.querySelector('.section-skills')
  const items = document.querySelectorAll('.skill-item')

  items.forEach((item) => {
    const level = parseInt(item.dataset.level, 10)
    const fill = item.querySelector('.skill-bar-fill')
    const valueEl = item.querySelector('.skill-value')

    const obj = { val: 0 }

    gsap.to(fill, {
      width: `${level}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1,
      },
    })

    gsap.to(obj, {
      val: level,
      ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1,
      },
      onUpdate: () => {
        valueEl.textContent = Math.round(obj.val)
      },
    })
  })
}

function initJourney() {
  const section = document.querySelector('.section-journey')
  const line = document.querySelector('.timeline-line')
  const items = document.querySelectorAll('.timeline-item')

  gsap.to(line, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 1,
    },
  })

  items.forEach((item, i) => {
    const fromX = i % 2 === 0 ? -60 : 60

    gsap.fromTo(
      item,
      { opacity: 0, x: fromX },
      {
        opacity: 1,
        x: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 1,
          onEnter: () => item.classList.add('is-active'),
          onLeaveBack: () => item.classList.remove('is-active'),
        },
      }
    )

    ScrollTrigger.create({
      trigger: item,
      start: 'center center',
      onEnter: () => item.classList.add('is-active'),
      onLeave: () => item.classList.remove('is-active'),
      onEnterBack: () => item.classList.add('is-active'),
      onLeaveBack: () => item.classList.remove('is-active'),
    })
  })
}

function initProjects() {
  const pin = document.querySelector('.projects-pin')
  const track = document.querySelector('.projects-track')
  const panels = document.querySelectorAll('.project-panel')
  if (!pin || !track || panels.length === 0) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 769px)', () => {
    let scrollDistance = 0

    const measure = () => {
      gsap.set(track, { x: 0 })
      scrollDistance = Math.max(0, track.scrollWidth - pin.offsetWidth)
    }

    measure()
    ScrollTrigger.addEventListener('refreshInit', measure)

    gsap.set(track, { x: 0, force3D: true })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        pin: true,
        pinType: 'transform',
        scrub: true,
        anticipatePin: 1,
        pinSpacing: true,
        invalidateOnRefresh: true,
      },
    })

    tl.to(
      track,
      {
        x: () => -scrollDistance,
        ease: 'none',
        force3D: true,
      },
      0
    )

    panels.forEach((panel) => {
      const img = panel.querySelector('.project-image-wrap img')
      const stats = panel.querySelectorAll('.stat-value')

      if (img) {
        gsap.fromTo(
          img,
          { scale: 1 },
          {
            scale: 1.08,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 75%',
              end: 'right 25%',
              scrub: true,
            },
          }
        )
      }

      stats.forEach((stat) => {
        const target = parseFloat(stat.dataset.value)
        const suffix = stat.dataset.suffix || ''
        const decimals = parseInt(stat.dataset.decimals || '0', 10)
        const obj = { val: 0 }

        gsap.to(obj, {
          val: target,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left 80%',
            end: 'left 55%',
            scrub: true,
          },
          onUpdate: () => {
            stat.textContent =
              (decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val)) + suffix
          },
        })
      })

      const tags = panel.querySelectorAll('.tech-tag')
      gsap.fromTo(
        tags,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left 75%',
            end: 'left 50%',
            scrub: true,
          },
        }
      )
    })

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure)
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  })
}

function initBlog() {
  const cards = document.querySelectorAll('.blog-card')

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.blog-grid',
      start: 'top 80%',
    },
  })
}

function initUpdates() {
  const items = document.querySelectorAll('.update-item')

  gsap.to(items, {
    opacity: 1,
    x: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.updates-list',
      start: 'top 85%',
    },
  })
}
