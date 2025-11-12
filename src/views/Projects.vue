<!-- src/views/Projects.vue -->
<template>
  <div class="projects">
    <h1>My Projects</h1>
    <div v-if="loading">Loading projects...</div>
    <div v-else class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <img :src="project.image" :alt="project.title" />
        <h3>{{ project.title }}</h3>
        <p>{{ project.introduction }}</p>
        <router-link :to="`/projects/${project.id}`">View Details</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Projects',
  setup() {
    const projects = ref([])
    const loading = ref(true)

    onMounted(async () => {
      try {
        const response = await fetch('/data/projects.json')
        projects.value = await response.json()
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        loading.value = false
      }
    })

    return { projects, loading }
  }
}
</script>

<style scoped>
.projects {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.project-card {
  background: #2d2d2d;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.project-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 1rem;
  filter: grayscale(100%);
}

.project-card h3 {
  margin-bottom: 0.5rem;
  color: #aaa;
}

.project-card a {
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
}

.project-card a:hover {
  text-decoration: underline;
}
</style>

