import { useEffect, useState } from 'react'
import DisplayCards from '@/components/ui/display-cards'
import { GraduationCap, Users } from 'lucide-react'

interface LinkEntry {
  name: string
  url: string
  role: string
  description: string
}

interface LinksData {
  links: LinkEntry[]
}

const STACK_CLASS =
  "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:bg-background/50 before:content-[''] before:bg-blend-overlay before:outline-1 before:outline-border hover:before:opacity-0 before:transition-opacity before:duration-700 grayscale-[100%] hover:grayscale-0"

const DESKTOP_OFFSETS = [
  `[grid-area:stack] hover:-translate-y-10 ${STACK_CLASS}`,
  `[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 ${STACK_CLASS}`,
  `[grid-area:stack] translate-x-24 translate-y-20 hover:-translate-y-1 ${STACK_CLASS}`,
  `[grid-area:stack] translate-x-36 translate-y-[4.5rem] hover:translate-y-10 ${STACK_CLASS}`,
]

const MOBILE_OFFSETS = [
  `[grid-area:stack] hover:-translate-y-2 ${STACK_CLASS}`,
  `[grid-area:stack] translate-y-4 hover:-translate-y-1 ${STACK_CLASS}`,
  `[grid-area:stack] translate-y-8 hover:-translate-y-1 ${STACK_CLASS}`,
  `[grid-area:stack] translate-y-12 hover:translate-y-6 ${STACK_CLASS}`,
]

function linkIcon(role: string) {
  const Icon = role === '老师' ? GraduationCap : Users
  return <Icon className="size-4 text-[var(--egg)]" aria-hidden />
}

export default function FriendLinks() {
  const [links, setLinks] = useState<LinkEntry[]>([])
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    fetch(`${base}data/links.json`)
      .then((r) => r.json())
      .then((data: LinksData) => setLinks(data.links))
      .catch(() => setLinks([]))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (links.length === 0) {
    return null
  }

  const offsets = compact ? MOBILE_OFFSETS : DESKTOP_OFFSETS

  const cards = links.map((link, index) => ({
    href: link.url,
    icon: linkIcon(link.role),
    title: link.name,
    description: link.description,
    date: link.role,
    iconClassName: 'text-[var(--egg)]',
    titleClassName: 'text-[var(--egg)]',
    className: offsets[index] ?? offsets[offsets.length - 1],
  }))

  return (
    <div className="flex min-h-[22rem] w-full items-center justify-center py-8 md:min-h-[28rem] md:py-12">
      <div className="w-full max-w-3xl">
        <DisplayCards cards={cards} />
      </div>
    </div>
  )
}
