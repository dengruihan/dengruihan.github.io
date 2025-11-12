<!-- src/views/ProjectDetail.vue -->
<template>
  <div v-if="project" class="project-detail">
    <router-link to="/projects" class="back-link">← Back to Projects</router-link>
    <h1>{{ project.title }}</h1>
    <img :src="project.image" :alt="project.title" />
    <p><strong>Introduction:</strong> {{ project.introduction }}</p>
    <div>
      <strong>Tech Stack:</strong>
      <ul>
        <li v-for="tech in project.techStack" :key="tech">{{ tech }}</li>
      </ul>
    </div>
    <p><strong>Details:</strong></p>
    <p>{{ project.details }}</p>
    <div class="project-links">
      <a :href="project.githubUrl" target="_blank">GitHub Repo</a>
      <a v-if="project.liveDemoUrl" :href="project.liveDemoUrl" target="_blank">Live Demo</a>
    </div>
  </div>
  <div v-else>
    <p>Project not found.</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'ProjectDetail',
  setup() {
    const project = ref(null)
    const route = useRoute()

    const fetchProject = async () => {
      const id = parseInt(route.params.id)
      try {
        const response = await fetch('./data/projects.json')
        const projects = await response.json()
        project.value = projects.find(p => p.id === id)
      } catch (error) {
        console.error("Failed to load project:", error)
      }
    }

    onMounted(fetchProject)
    watch(() => route.params.id, fetchProject)

    return { project }
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

.back-link {
  color: #aaa;
  text-decoration: none;
  margin-bottom: 1rem;
  display: inline-block;
}

.project-links {
  margin-top: 2rem;
}

.project-links a {
  margin-right: 1rem;
  color: #aaa;
  text-decoration: none;
}

.project-links a:hover {
  text-decoration: underline;
}
</style>
