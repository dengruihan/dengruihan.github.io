<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-text">RuiHan Deng</span>
        </router-link>
      </div>
      
      <div class="nav-menu" :class="{ 'active': isMenuOpen }">
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path" 
          class="nav-link"
          @click="closeMenu"
        >
          {{ item.name }}
        </router-link>
      </div>
      
      <div class="nav-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Navbar',
  setup() {
    const isMenuOpen = ref(false)
    
    const navItems = [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Skills', path: '/skills' },
      { name: 'Projects', path: '/projects' },
      { name: 'Blog', path: '/blog' },
      { name: 'Links', path: '/links' }
    ]
    
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    
    const closeMenu = () => {
      isMenuOpen.value = false
    }
    
    return {
      isMenuOpen,
      navItems,
      toggleMenu,
      closeMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  z-index: 1000;
  height: 70px;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  text-decoration: none;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #ffffff, #888888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #bbbbbb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(128, 128, 128, 0.2);
}

.nav-link.router-link-exact-active {
  color: #ffffff;
  background: rgba(128, 128, 128, 0.3);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: #888888;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    position: fixed;
    top: 70px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 70px);
    background: #1a1a1a;
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem;
    transition: 0.3s;
    gap: 1rem;
  }
  
  .nav-menu.active {
    left: 0;
  }
  
  .nav-link {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1.1rem;
  }
  
  .nav-toggle {
    display: flex;
  }
}
</style>