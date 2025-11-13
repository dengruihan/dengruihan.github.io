<!-- src/views/Projects.vue -->
<template>
  <div class="projects">
    <div class="projects-header">
      <h1>My Projects</h1>
      <p class="subtitle">Explore my latest work and creative solutions</p>
      <div v-if="currentInterest" class="filter-info">
        <span>Showing projects for: <strong>{{ currentInterest }}</strong></span>
        <button @click="clearFilter" class="clear-filter-btn">Clear Filter</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading projects...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>Failed to load projects. Please try again later.</p>
      <button @click="loadProjects" class="retry-btn">Retry</button>
    </div>
    
    <div v-else-if="projects.length === 0" class="no-projects">
      <p>No projects available at the moment.</p>
    </div>
    
    <div v-else class="project-grid">
      <div 
        v-for="project in projects" 
        :key="project.id" 
        class="project-card"
        @mouseenter="hoveredProject = project.id"
        @mouseleave="hoveredProject = null"
      >
        <div class="project-image-container">
          <img 
            :src="project.image" 
            :alt="project.title"
            :class="{ 'image-hovered': hoveredProject === project.id }"
          />
          <div class="project-overlay" v-if="hoveredProject === project.id">
            <div class="tech-stack">
              <span 
                v-for="tech in project.techStack?.slice(0, 3)" 
                :key="tech"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="project-content">
          <h3>{{ project.title }}</h3>
          <p>{{ project.introduction }}</p>
        </div>
        
        <!-- 确保按钮始终在底部 -->
        <div class="card-footer">
          <div class="project-links">
            <router-link 
              :to="`/projects/${project.id}`" 
              class="view-details-btn"
            >
              View Details
            </router-link>
            <a 
              v-if="project.githubUrl" 
              :href="project.githubUrl" 
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
              title="View on GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Projects',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const projects = ref([])
    const filteredProjects = ref([])
    const loading = ref(true)
    const error = ref(null)
    const hoveredProject = ref(null)
    const currentInterest = ref(route.query.interest || '')

    const loadProjects = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const allProjects = await response.json()
        projects.value = allProjects
        filterProjects()
      } catch (err) {
        console.error("Failed to load projects:", err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const filterProjects = () => {
      if (!currentInterest.value) {
        filteredProjects.value = projects.value
      } else {
        filteredProjects.value = projects.value.filter(project => 
          project.interests && project.interests.includes(currentInterest.value)
        )
      }
    }

    const clearFilter = () => {
      currentInterest.value = ''
      router.push({ path: '/projects' })
    }

    watch(() => route.query.interest, (newInterest) => {
      currentInterest.value = newInterest || ''
      filterProjects()
    })

    onMounted(() => {
      loadProjects()
    })

    return { 
      projects: filteredProjects, 
      loading, 
      error, 
      hoveredProject,
      currentInterest,
      clearFilter,
      loadProjects 
    }
  }
}
</script>

<style scoped>
/* 黑白配色方案 */
.projects {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #000000; /* 纯黑背景 */
  color: #ffffff;
  min-height: 100vh;
}

.projects-header {
  text-align: center;
  margin-bottom: 3rem;
}

.projects-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #808080 100%); /* 白到灰渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #a0a0a0; /* 中灰色 */
  font-size: 1.1rem;
}

.filter-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 20px;
  color: #aaa;
}

.clear-filter-btn {
  padding: 0.4rem 1rem;
  background: #444;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-filter-btn:hover {
  background: #666;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  position: relative;
  margin-bottom: 1rem;
}

.loading-spinner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 3px solid #333333;
  border-top-color: #ffffff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error, .no-projects {
  text-align: center;
  padding: 4rem 0;
  color: #a0a0a0; /* 中灰色 */
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #404040; /* 深灰色按钮 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #606060; /* 悬停时更亮 */
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.project-card {
  background: #1a1a1a; /* 深灰色卡片背景 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5); /* 更深的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #333333; /* 添加边框增强对比 */
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.7); /* 悬停时更深的阴影 */
}

.project-image-container {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.project-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: grayscale(100%); /* 保持黑白滤镜 */
}

.project-card img.image-hovered {
  transform: scale(1.05);
  filter: grayscale(80%); /* 悬停时稍微减少黑白效果 */
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8); /* 更深的黑色遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tech-tag {
  background: rgba(128, 128, 128, 0.8); /* 灰色标签 */
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.project-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.project-content h3 {
  margin-bottom: 0.75rem;
  color: #ffffff; /* 白色标题 */
  font-size: 1.3rem;
}

.project-content p {
  color: #c0c0c0; /* 浅灰色描述文字 */
  line-height: 1.6;
  margin-bottom: 0;
  flex: 1;
}

.card-footer {
  padding: 1.5rem;
  padding-top: 0;
  margin-top: auto;
  flex-shrink: 0;
}

.project-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-details-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #404040 0%, #606060 100%); /* 灰色渐变 */
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  flex: 1;
  text-align: center;
  border: 1px solid #555555; /* 添加边框 */
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 128, 128, 0.3); /* 灰色阴影 */
  background: linear-gradient(135deg, #505050 0%, #707070 100%); /* 悬停时更亮 */
  text-decoration: none;
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #2a2a2a; /* 深灰色背景 */
  color: #a0a0a0; /* 中灰色图标 */
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
  flex-shrink: 0;
  border: 1px solid #444444; /* 添加边框 */
}

.github-link:hover {
  background: #3a3a3a; /* 悬停时更亮 */
  color: #ffffff; /* 悬停时白色图标 */
  text-decoration: none;
}

@media (max-width: 768px) {
  .projects {
    padding: 1rem;
  }
  
  .projects-header h1 {
    font-size: 2rem;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .project-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .view-details-btn {
    width: 100%;
  }
  
  .github-link {
    width: 100%;
  }
}
</style>
