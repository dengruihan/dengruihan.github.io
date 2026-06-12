import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initAnimations() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  initRiverThread()
  initHero()
  initAbout()
  initSkills()
  initJourney()
  initProjects()
  initBlog()
  initUpdates()
  initRiverNodes()
  positionRiverNodes()

  window.addEventListener('resize', positionRiverNodes)
  ScrollTrigger.addEventListener('refresh', positionRiverNodes)

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    positionRiverNodes()
  })
}

function initRiverThread() {
  const path = document.querySelector('.river-path')
  if (!path) return

  const length = path.getTotalLength()
  path.style.strokeDasharray = length
  path.style.strokeDashoffset = length

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  })
}

function positionRiverNodes() {
  const sections = document.querySelectorAll('[data-section]')
  const nodes = document.querySelectorAll('.river-node')
  const riverHeight = document.documentElement.scrollHeight

  sections.forEach((section) => {
    const name = section.dataset.section
    const node = document.querySelector(`.river-node[data-section="${name}"]`)
    if (!node) return
    const rect = section.getBoundingClientRect()
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const sectionTop = rect.top + scrollY
    const pct = (sectionTop / riverHeight) * 100
    node.style.top = `${Math.min(Math.max(pct, 2), 98)}%`
  })
}

function initRiverNodes() {
  const sections = document.querySelectorAll('section[data-section]')
  sections.forEach((section) => {
    const name = section.dataset.section
    const node = document.querySelector(`.river-node[data-section="${name}"]`)
    if (!node) return

    ScrollTrigger.create({
      trigger: section,
      start: 'center center',
      end: 'center center',
      onEnter: () => node.classList.add('is-active'),
      onLeave: () => node.classList.remove('is-active'),
      onEnterBack: () => node.classList.add('is-active'),
      onLeaveBack: () => node.classList.remove('is-active'),
    })
  })
}

function initHero() {
  const hero = document.querySelector('.section-hero')
  const pin = document.querySelector('.hero-pin')
  const words = document.querySelectorAll('.hero-word')
  const tagline = document.querySelector('.hero-tagline')
  const bio = document.querySelector('.hero-bio')
  const actions = document.querySelector('.hero-actions')
  const cue = document.querySelector('.scroll-cue')
  const layers = {
    sky: document.querySelector('.hero-layer--sky'),
    reedsBack: document.querySelector('.hero-layer--reeds-back'),
    water: document.querySelector('.hero-layer--water'),
    reedsFront: document.querySelector('.hero-layer--reeds-front'),
  }

  gsap.set(words, { opacity: 0, y: 40 })
  gsap.set([tagline, bio, actions, cue], { opacity: 0, y: 20 })

  const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  loadTl
    .to(words, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 })
    .to(tagline, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to(bio, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to(actions, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to(cue, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')

  const mm = gsap.matchMedia()

  mm.add('(min-width: 769px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=150%',
        pin: pin,
        scrub: 1,
      },
    })

    tl.to(
      layers.sky,
      { scale: 1.15, y: '-8%', ease: 'none' },
      0
    )
      .to(layers.reedsBack, { scale: 1.2, y: '-15%', ease: 'none' }, 0)
      .to(layers.water, { scale: 1.25, y: '-5%', ease: 'none' }, 0)
      .to(layers.reedsFront, { scale: 1.3, y: '-20%', ease: 'none' }, 0)
      .to([tagline, bio, actions, cue], { opacity: 0, y: -30, ease: 'none' }, 0)
      .to(words, { scale: 0.95, ease: 'none' }, 0)

    return () => tl.kill()
  })
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
  const section = document.querySelector('.section-projects')
  const track = document.querySelector('.projects-track')
  const panels = document.querySelectorAll('.project-panel')
  if (!track || panels.length === 0) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 769px)', () => {
    const getScrollDistance = () => track.scrollWidth - window.innerWidth

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: '.projects-pin',
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    tl.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
    })

    panels.forEach((panel) => {
      const img = panel.querySelector('.project-image-wrap img')
      const stats = panel.querySelectorAll('.stat-value')

      if (img) {
        gsap.to(img, {
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left center',
            end: 'right center',
            scrub: true,
          },
        })
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
            end: 'left 40%',
            scrub: 1,
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
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left 70%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    return () => {
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
