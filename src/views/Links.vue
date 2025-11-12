<!-- src/views/Links.vue -->
<template>
  <div class="links">
    <h1>Interesting Links</h1>
    <div class="links-grid">
      <a v-for="link in links" :key="link.id" :href="link.url" target="_blank" class="link-card">
        <h3>{{ link.title }}</h3>
        <p>{{ link.description }}</p>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Links',
  data() {
    return {
      links: [
        {
          id: 1,
          title: 'Vue.js Official Documentation',
          url: 'https://vuejs.org/',
          description: 'The official guide for Vue.js framework'
        },
        {
          id: 2,
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/',
          description: 'Great resource for web technologies'
        }
      ]
    }
  }
}
</script>

<style scoped>
.links {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.link-card {
  display: block;
  padding: 1.5rem;
  background: #2d2d2d;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.link-card h3 {
  color: #aaa;
  margin-bottom: 0.5rem;
}
</style>