<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <div class="container">
      <!-- 左侧个人信息栏 -->
      <aside class="sidebar">
        <div class="profile-section">
          <!-- 头像 -->
          <div class="avatar-container">
            <img src="/avatar.jpg" alt="Profile" class="avatar" />
            <div class="avatar-ring"></div>
          </div>
          
          <!-- 姓名 -->
          <h1 class="name">RuiHan Deng</h1>
          
          <!-- 一句话总结 -->
          <p class="tagline">Full Stack Developer & Creative Thinker</p>
          
          <!-- 简介 -->
          <div class="bio">
            <p>
              Passionate about building creative and contributory product. 
              Specialize in Python, LLM, and Politics.
              Always learning, always creating.
            </p>
          </div>
          
          <!-- 联系方式按钮 -->
          <div class="contact-buttons">
            <a href="mailto:Raymond.dengruihan@yungu.org" class="contact-btn primary">
              <span class="btn-icon">📧</span>
              Email Me
            </a>
            <a 
              href="https://github.com/dengruihan" 
              target="_blank"
              rel="noopener noreferrer"
              class="contact-btn secondary"
            >
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </span>
              GitHub
            </a>
          </div>
          
          
          <!-- 额外内容，使左侧可滚动 -->
          <!-- 在Home.vue的侧边栏部分 -->
          <div class="additional-content">
            <h3>Quick Facts</h3>
            <ul>
              <li v-for="fact in quickFacts" :key="fact">{{ fact }}</li>
            </ul>
            
            <h3>Current Focus</h3>
            <p>{{ currentFocus }}</p>
            
            <h3>Hobbies</h3>
            <p>{{ hobbies }}</p>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="main-content">
        <!-- 个人项目 -->
        <section class="projects-section">
          <h2 class="section-title">
            <span class="title-icon">🚀</span>
            Featured Projects
          </h2>
          <div class="projects-grid">
            <div v-for="project in featuredProjects" :key="project.id" class="project-card">
              <div class="project-image">
                <img :src="project.image" :alt="project.title" />
                <div class="project-overlay">
                  <a :href="project.githubUrl" target="_blank" class="project-link">
                    <span>📦</span>
                  </a>
                  <a v-if="project.liveDemoUrl" :href="project.liveDemoUrl" target="_blank" class="project-link">
                    <span>🌐</span>
                  </a>
                </div>
              </div>
              <div class="project-content">
                <h3>{{ project.title }}</h3>
                <p>{{ project.introduction }}</p>
                <div class="project-tech">
                  <span v-for="tech in project.techStack" :key="tech" class="tech-tag">
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="section-footer">
            <router-link to="/projects" class="view-all-btn">View All Projects →</router-link>
          </div>
        </section>

        <!-- Blog -->
        <section class="blog-section">
          <h2 class="section-title">
            <span class="title-icon">📝</span>
            Recent Blog Posts
          </h2>
          <div class="blog-list">
            <article v-for="post in recentPosts" :key="post.id" class="blog-post">
              <div class="blog-meta">
                <span class="blog-date">{{ post.date }}</span>
                <span class="blog-reading-time">5 min read</span>
              </div>
              <h3>{{ post.title }}</h3>
              <p class="blog-excerpt">{{ post.excerpt }}</p>
              <router-link :to="`/blog/${post.id}`" class="blog-link">
                Read more →
              </router-link>
            </article>
          </div>
          <div class="section-footer">
            <router-link to="/blog" class="view-all-btn">View All Posts →</router-link>
          </div>
        </section>

        <section class="updates-section">
          <h2 class="section-title">
            <span class="title-icon">🔔</span>
            Latest Updates
          </h2>
          <div class="updates-list">
            <div class="update-item" v-for="update in updates" :key="update.id">
              <div class="update-date">{{ update.date }}</div>
              <div class="update-content">
                <h3>{{ update.title }}</h3>
                <p>{{ update.description }}</p>
                <a v-if="update.link" :href="update.link" class="update-link">Learn more →</a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    const updates = ref([
      {
        id: 1,
        date: '2025-11-10',
        title: '🎉 New Portfolio Launched',
        description: 'Just launched my new personal portfolio website built with Vue 3 and Vite!',
        link: null
      },
      {
        id: 2,
        date: '2025-11-08',
        title: '📝 Published New Blog Post',
        description: 'Wrote about my experience training LLM to detect species.',
        link: '/blog/ai-forest-ranger-hangzhou'
      },
      {
        id: 3,
        date: '2025-04-23',
        title: '🐌 Completed Eco Protect Project',
        description: 'Finished a AI powered Eco Protect application with GUI',
        link: '/projects/3'
      }
    ])

    const featuredProjects = ref([])
    const recentPosts = ref([])
    const quickFacts = ref([])
    const currentFocus = ref("")
    const hobbies = ref("")

    // 加载项目数据
    const loadProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
        const projects = await response.json()
        featuredProjects.value = projects.slice(0, 3)
      } catch (error) {
        console.error("Failed to load projects:", error)
      }
    }

    // 加载博客数据
    const loadPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/blog.json`)
        const posts = await response.json()
        recentPosts.value = posts.slice(0, 3)
      } catch (error) {
        console.error("Failed to load blog posts:", error)
      }
    }

    // 加载About数据
    const loadAboutData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/about.json`)
        const data = await response.json()
        quickFacts.value = data.quickFacts
        currentFocus.value = data.currentFocus
        hobbies.value = data.hobbies
      } catch (error) {
        console.error("Failed to load about data:", error)
      }
    }

    onMounted(() => {
      loadProjects()
      loadPosts()
      loadAboutData()
    })

    return {
      updates,
      featuredProjects,
      recentPosts,
      quickFacts,
      currentFocus,
      hobbies
    }
  }
}
</script>


<style scoped>
/* 整体布局 */
.home {
  height: calc(100vh - var(--navbar-height));
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.container {
  height: 100%;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 0;
  max-width: 100%;
}

/* 左侧边栏 - 可滚动 */
.sidebar {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.profile-section {
  background: rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  min-height: 100%;
}

/* 头像 */
.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #555;
  box-shadow: 0 0 30px rgba(128, 128, 128, 0.5);
}

.avatar-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid #777;
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 个人信息 */
.name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.bio {
  margin-bottom: 2rem;
}

.bio p {
  color: #bbb;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 联系按钮 */
.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  gap: 0.5rem;
}

.contact-btn.primary {
  background: linear-gradient(to right, #444, #666);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.contact-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.contact-btn.secondary {
  background: rgba(128, 128, 128, 0.1);
  color: #aaa;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

.contact-btn.secondary:hover {
  background: rgba(128, 128, 128, 0.2);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 社交链接 */
.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #555;
  transform: translateY(-3px);
}

.social-link span {
  font-size: 1.2rem;
}

/* 额外内容区域 */
.additional-content {
  text-align: left;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.additional-content h3 {
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  margin-top: 1.5rem;
}

.additional-content h3:first-child {
  margin-top: 0;
}

.additional-content ul {
  list-style-type: none;
  padding-left: 0;
}

.additional-content li {
  color: #bbb;
  margin-bottom: 0.5rem;
  padding-left: 1.2rem;
  position: relative;
}

.additional-content li::before {
  content: "•";
  color: #666;
  position: absolute;
  left: 0;
}

.additional-content p {
  color: #bbb;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 右侧主内容 - 可滚动 */
.main-content {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 自定义滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 通用区域样式 */
section {
  background: rgba(40, 40, 40, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #aaa;
}

.title-icon {
  font-size: 1.5rem;
}

/* 动态区域 */
.updates-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.update-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(128, 128, 128, 0.05);
  border-radius: 12px;
  border-left: 3px solid #555;
  transition: all 0.3s ease;
}

.update-item:hover {
  background: rgba(128, 128, 128, 0.1);
  transform: translateX(5px);
}

.update-date {
  color: #888;
  font-size: 0.9rem;
  min-width: 100px;
}

.update-content h3 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.update-content p {
  color: #bbb;
  margin-bottom: 0.5rem;
}

.update-link {
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
}

.update-link:hover {
  text-decoration: underline;
}

/* 项目区域 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.project-card {
  background: rgba(128, 128, 128, 0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.project-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-link {
  width: 40px;
  height: 40px;
  background: #555;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
}

.project-link:hover {
  transform: scale(1.1);
  background: #777;
}

.project-content {
  padding: 1.5rem;
}

.project-content h3 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.project-content p {
  color: #bbb;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background: rgba(128, 128, 128, 0.2);
  color: #aaa;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* Blog区域 */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.blog-post {
  padding: 1.5rem;
  background: rgba(128, 128, 128, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.blog-post:hover {
  background: rgba(128, 128, 128, 0.1);
  transform: translateX(5px);
}

.blog-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.blog-date, .blog-reading-time {
  color: #888;
  font-size: 0.9rem;
}

.blog-post h3 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.blog-excerpt {
  color: #bbb;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.blog-link {
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
}

.blog-link:hover {
  text-decoration: underline;
}

/* 区域底部 */
.section-footer {
  text-align: center;
  padding-top: 1rem;
}

.view-all-btn {
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 1px solid #555;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #555;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .main-content {
    height: 60vh;
  }
  
  .projects-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .home {
    height: calc(100vh - var(--navbar-height));
  }
  
  .profile-section {
    padding: 2rem 1.5rem;
  }
  
  .name {
    font-size: 1.5rem;
  }
  
  section {
    padding: 1.5rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .update-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .update-date {
    min-width: auto;
  }
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #333;
  color: #aaa;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
  flex-shrink: 0; /* 防止GitHub图标被压缩 */
}

.github-link:hover {
  background: #444;
  color: #fff;
  text-decoration: none;
}
</style>
