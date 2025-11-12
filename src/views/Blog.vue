<!-- src/views/Blog.vue -->
<template>
  <div class="blog">
    <h1>My Blog</h1>
    <div v-if="loading">Loading posts...</div>
    <div v-else class="blog-list">
      <article v-for="post in posts" :key="post.id" class="blog-post">
        <h2>{{ post.title }}</h2>
        <p class="post-date">{{ post.date }}</p>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        <router-link :to="`/blog/${post.id}`">Read More</router-link>
      </article>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Blog',
  setup() {
    const posts = ref([])
    const loading = ref(true)

    onMounted(async () => {
      try {
        const response = await fetch('/data/blog.json')
        posts.value = await response.json()
      } catch (error) {
        console.error("Failed to load blog posts:", error)
      } finally {
        loading.value = false
      }
    })

    return { posts, loading }
  }
}
</script>

<style scoped>
.blog {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

.blog-list {
  margin-top: 2rem;
}

.blog-post {
  background: #2d2d2d;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.post-date {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.post-excerpt {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #bbb;
}

.blog-post a {
  color: #aaa;
  text-decoration: none;
  font-weight: 500;
}

.blog-post a:hover {
  text-decoration: underline;
}
</style>
