/* Viewport — the single source of truth for "small screen" / "touch"
   judgements across the 2D page and the 3D scene. The MediaQueryLists
   are live objects: .matches re-evaluates on resize/orientation change,
   so layout decisions read them per use instead of latching at boot. */

// matches the CSS mobile-layout breakpoint (css/main.css @media max-width: 768px)
export const narrowMQ = window.matchMedia('(max-width: 768px)')

// primary input is touch (a desktop with a touchscreen stays "fine" here
// only if the OS reports it so — same probe the scene boot uses)
export const coarseMQ = window.matchMedia('(pointer: coarse)')

export const isNarrow = () => narrowMQ.matches
export const isCoarse = () => coarseMQ.matches
