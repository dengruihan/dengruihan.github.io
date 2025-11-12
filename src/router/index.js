import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/skills', name: 'Skills', component: () => import('../views/Skills.vue') },
  
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/projects/:id', name: 'ProjectDetail', component: () => import('../views/ProjectDetail.vue'), props: true },
  
  { path: '/blog', name: 'Blog', component: () => import('../views/Blog.vue') },
  { path: '/blog/:id', name: 'BlogDetail', component: () => import('../views/BlogDetail.vue'), props: true }
]

const router = createRouter({
  history: createWebHistory('/personal-portfolio/'),
  routes
})

export default router
