import { createRoot } from 'react-dom/client'
import FriendLinks from './FriendLinks'
import './island.css'

const rootEl = document.getElementById('friend-links-root')

if (rootEl) {
  createRoot(rootEl).render(<FriendLinks />)
}
