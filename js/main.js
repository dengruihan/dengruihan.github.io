const DATA_BASE = 'data/'

const PROJECT_STATS = {
  1: [
    { value: 91, suffix: '%', label: 'Detection accuracy' },
    { value: 83.8, suffix: '%', label: 'Previous YOLO baseline', decimals: 1 },
  ],
  2: [
    { value: 5000, suffix: '', label: 'Images processed' },
    { value: 2, suffix: 's', label: 'Processing time' },
    { value: 2.25, suffix: '%', label: 'Error rate', decimals: 2 },
  ],
  3: [
    { value: 100, suffix: '+', label: 'Open day visitors' },
  ],
}

let blogPosts = []

async function loadData() {
  const [about, skills, projects, blog, links] = await Promise.all([
    fetch(`${DATA_BASE}about.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}skills.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}projects.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}blog.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}links.json`).then((r) => r.json()),
  ])
  return { about, skills, projects, blog, links }
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function formatStatValue(stat) {
  const decimals = stat.decimals ?? 0
  const value = decimals > 0 ? stat.value.toFixed(decimals) : Math.round(stat.value)
  return `${value}${stat.suffix}`
}

function linkIconSvg(role) {
  if (role === '老师') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>`
}

function renderAbout(about) {
  document.getElementById('about-lead').textContent = about.story.leadText

  const paragraphsEl = document.getElementById('about-paragraphs')
  paragraphsEl.innerHTML = about.story.paragraphs
    .map((p) => `<p class="story-paragraph">${escapeHtml(p)}</p>`)
    .join('')

  document.getElementById('current-focus').textContent = about.currentFocus
  document.getElementById('hobbies').textContent = about.hobbies

  const factsEl = document.getElementById('quick-facts')
  factsEl.innerHTML = about.quickFacts
    .map((f) => `<div class="fact-item">${escapeHtml(f)}</div>`)
    .join('')

  const goalsEl = document.getElementById('goals-grid')
  goalsEl.innerHTML = about.goals
    .map(
      (g) => `
    <article class="goal-card">
      <h3>${escapeHtml(g.title)}</h3>
      <p>${escapeHtml(g.description)}</p>
    </article>`
    )
    .join('')

  const updatesEl = document.getElementById('updates-list')
  updatesEl.innerHTML = about.updates
    .map((u) => {
      const link =
        u.link && u.link.startsWith('/blog/')
          ? `<button type="button" class="update-link blog-hash-link" data-blog-id="${escapeHtml(u.link.replace('/blog/', ''))}">Learn more →</button>`
          : u.link?.startsWith('/projects/')
            ? `<a href="#projects" class="update-link">Learn more →</a>`
            : u.link
              ? `<a href="${escapeHtml(u.link)}" class="update-link">Learn more →</a>`
              : ''
      return `
    <li class="update-item">
      <time class="update-date" datetime="${escapeHtml(u.date)}">${escapeHtml(u.date)}</time>
      <div>
        <h3>${escapeHtml(u.title)}</h3>
        <p>${escapeHtml(u.description)}</p>
        ${link}
      </div>
    </li>`
    })
    .join('')
}

function renderSkills(skills) {
  const listEl = document.getElementById('skills-list')
  listEl.innerHTML = skills.skillset
    .map(
      (s, i) => `
    <div class="skill-item" data-level="${s.level}">
      <span class="skill-name">${escapeHtml(s.name)}</span>
      <span class="skill-value">${s.level}</span>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" style="--skill-level: ${s.level}%; --skill-delay: ${i * 0.12}s"></div>
      </div>
    </div>`
    )
    .join('')
}

function renderTimeline(education) {
  const listEl = document.getElementById('timeline-list')
  listEl.innerHTML = education
    .map(
      (item) => `
    <li class="timeline-item">
      <div class="timeline-node" aria-hidden="true"></div>
      <article class="timeline-card">
        <time class="timeline-date" datetime="${escapeHtml(item.date)}">${escapeHtml(item.date)}</time>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${item.details ? `<p class="timeline-details">${escapeHtml(item.details)}</p>` : ''}
      </article>
    </li>`
    )
    .join('')
}

function imageFallback(img) {
  img.onerror = () => {
    img.src =
      'data:image/svg+xml,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#14291F" width="400" height="300"/><circle cx="200" cy="140" r="24" fill="#F2789F" opacity="0.8"/><circle cx="185" cy="130" r="8" fill="#F2789F"/><circle cx="215" cy="135" r="6" fill="#F2789F"/></svg>`
      )
    img.classList.add('is-fallback')
    img.onerror = null
  }
}

function renderProjectPanel(project) {
  const stats = PROJECT_STATS[project.id] || []
  const statsHtml = stats
    .map(
      (s) => `
    <div class="project-stat">
      <span class="stat-value">${formatStatValue(s)}</span>
      <span class="stat-label">${escapeHtml(s.label)}</span>
    </div>`
    )
    .join('')

  const techHtml = project.techStack
    .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
    .join('')

  return `
  <article class="project-panel" data-project-id="${project.id}">
    <div class="project-image-wrap">
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="eager" decoding="async" />
    </div>
    <div class="project-content">
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project-intro">${escapeHtml(project.introduction)}</p>
      <div class="project-stats">${statsHtml}</div>
      <div class="tech-tags">${techHtml}</div>
      <div class="project-links">
        <a href="${escapeHtml(project.githubUrl)}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    </div>
  </article>`
}

function renderProjectCardMobile(project) {
  const stats = PROJECT_STATS[project.id] || []
  const statsHtml = stats
    .map(
      (s) =>
        `<span class="tech-tag">${formatStatValue(s)} ${escapeHtml(s.label)}</span>`
    )
    .join('')

  return `
  <article class="project-card-mobile css-reveal">
    <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" />
    <div class="project-card-body">
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project-intro">${escapeHtml(project.introduction)}</p>
      <div class="tech-tags">${statsHtml}</div>
      <div class="tech-tags">${project.techStack.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>
      <a href="${escapeHtml(project.githubUrl)}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  </article>`
}

function renderProjects(projects) {
  const trackEl = document.getElementById('projects-track')
  const stackEl = document.getElementById('projects-stack')

  trackEl.innerHTML = projects.map(renderProjectPanel).join('')
  stackEl.innerHTML = projects.map(renderProjectCardMobile).join('')

  document.querySelectorAll('.project-image-wrap img, .project-card-mobile img').forEach(imageFallback)
  setupProjectsScroll()
}

function setupProjectsScroll() {
  const zone = document.getElementById('projects-scroll-zone')
  const track = document.getElementById('projects-track')
  const pin = zone?.querySelector('.projects-pin')
  if (!zone || !track || !pin) return

  const apply = () => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      zone.style.removeProperty('--projects-scroll-h')
      zone.style.removeProperty('--projects-translate')
      track.style.removeProperty('transform')
      return
    }

    track.style.removeProperty('transform')

    const panels = track.querySelectorAll('.project-panel')
    const panelWidth = panels[0]?.offsetWidth || window.innerWidth
    const translateFactor =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--projects-translate-factor')) || 1.12
    const scrollDistance = Math.max(0, (panels.length - 1) * panelWidth * translateFactor)
    const scrollFactor =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--projects-scroll-factor')) || 2.9
    const extraScroll = scrollDistance * scrollFactor
    zone.style.setProperty('--projects-scroll-h', `${extraScroll + window.innerHeight}px`)
    zone.style.setProperty('--projects-translate', `${scrollDistance}px`)
  }

  apply()
  window.addEventListener('resize', apply)
  window.addEventListener('load', apply)
  track.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', apply, { once: true })
  })
}

function renderBlog(blog) {
  blogPosts = blog
  const gridEl = document.getElementById('blog-grid')
  gridEl.innerHTML = blog
    .map(
      (post) => `
    <button type="button" class="blog-card" data-blog-id="${escapeHtml(post.id)}" aria-label="Read: ${escapeHtml(post.title)}">
      <time class="blog-card-date" datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
      <h3>${escapeHtml(post.title)}</h3>
      <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
      <span class="blog-card-read">Read dispatch →</span>
    </button>`
    )
    .join('')
}

function renderFriendLinks(linksData) {
  const root = document.getElementById('friend-links-root')
  if (!root || !linksData.links?.length) return

  const cards = linksData.links
    .map(
      (link) => `
    <a
      class="friend-link-card"
      href="${escapeHtml(link.url)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${escapeHtml(link.name)} — ${escapeHtml(link.description)}"
    >
      <div>
        <span class="friend-link-icon">${linkIconSvg(link.role)}</span>
        <span class="friend-link-title">${escapeHtml(link.name)}</span>
      </div>
      <p class="friend-link-desc">${escapeHtml(link.description)}</p>
      <p class="friend-link-role">${escapeHtml(link.role)}</p>
    </a>`
    )
    .join('')

  root.innerHTML = `
    <div class="friend-links-wrap">
      <div class="friend-links-stack">${cards}</div>
    </div>`
}

function stripHtmlToParagraphs(html) {
  const cleaned = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = cleaned.split(/\n\n+/).filter(Boolean)
  if (parts.length > 1) {
    return parts.map((p) => `<p>${escapeHtml(p.trim())}</p>`).join('')
  }

  const sentences = cleaned.match(/[^。！？.!?]+[。！？.!?]?/g) || [cleaned]
  return sentences.map((s) => `<p>${escapeHtml(s.trim())}</p>`).join('')
}

function openBlogOverlay(id) {
  const post = blogPosts.find((p) => p.id === id)
  if (!post) return

  const overlay = document.getElementById('blog-overlay')
  document.getElementById('blog-overlay-date').textContent = post.date
  document.getElementById('blog-overlay-date').setAttribute('datetime', post.date)
  document.getElementById('blog-overlay-title').textContent = post.title
  document.getElementById('blog-overlay-body').innerHTML = stripHtmlToParagraphs(post.content)

  overlay.hidden = false
  overlay.scrollTop = 0
  document.body.style.overflow = 'hidden'
  location.hash = `blog/${id}`

  const progress = document.getElementById('blog-overlay-progress')
  progress.style.width = '0%'

  document.getElementById('blog-overlay-close').focus()
}

function closeBlogOverlay() {
  const overlay = document.getElementById('blog-overlay')
  overlay.hidden = true
  document.body.style.overflow = ''
  if (location.hash.startsWith('#blog/')) {
    history.pushState('', document.title, window.location.pathname + window.location.search)
  }
}

function setupBlogOverlay() {
  document.getElementById('blog-grid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-blog-id]')
    if (card) openBlogOverlay(card.dataset.blogId)
  })

  document.getElementById('updates-list').addEventListener('click', (e) => {
    const link = e.target.closest('.blog-hash-link')
    if (link) openBlogOverlay(link.dataset.blogId)
  })

  document.getElementById('blog-overlay-close').addEventListener('click', closeBlogOverlay)

  document.getElementById('blog-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'blog-overlay') closeBlogOverlay()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('blog-overlay').hidden) {
      closeBlogOverlay()
    }
  })

  const overlay = document.getElementById('blog-overlay')
  overlay.addEventListener('scroll', () => {
    const progress = document.getElementById('blog-overlay-progress')
    const max = overlay.scrollHeight - overlay.clientHeight
    const pct = max > 0 ? (overlay.scrollTop / max) * 100 : 0
    progress.style.width = `${pct}%`
  })

  window.addEventListener('hashchange', () => {
    const match = location.hash.match(/^#blog\/(.+)$/)
    if (match) openBlogOverlay(match[1])
    else if (!document.getElementById('blog-overlay').hidden) closeBlogOverlay()
  })
}

function handleInitialHash() {
  const match = location.hash.match(/^#blog\/(.+)$/)
  if (match) openBlogOverlay(match[1])
}

function restoreGitHubPagesRedirect() {
  const redirect = sessionStorage.getItem('redirect')
  if (redirect) {
    sessionStorage.removeItem('redirect')
    history.replaceState(null, '', redirect)
  }
}

function setupTimelineActiveState() {
  const items = document.querySelectorAll('.timeline-item')
  if (!items.length || !('IntersectionObserver' in window)) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-active', entry.isIntersecting)
      })
    },
    { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
  )

  items.forEach((item) => observer.observe(item))
}

function setupSkillBars() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const items = document.querySelectorAll('.skill-item')
  if (!items.length || !('IntersectionObserver' in window)) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.25 }
  )

  items.forEach((item) => observer.observe(item))
}

async function init() {
  restoreGitHubPagesRedirect()
  document.getElementById('year').textContent = new Date().getFullYear()

  const data = await loadData()
  renderAbout(data.about)
  renderSkills(data.skills)
  renderTimeline(data.skills.education)
  renderProjects(data.projects)
  renderBlog(data.blog)
  renderFriendLinks(data.links)
  setupBlogOverlay()
  setupTimelineActiveState()
  setupSkillBars()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion')
  }

  handleInitialHash()
}

init().catch(console.error)
