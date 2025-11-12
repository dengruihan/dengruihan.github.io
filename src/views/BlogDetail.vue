<!-- src/views/BlogDetail.vue -->
<template>
  <div v-if="post" class="blog-detail">
    <router-link to="/blog" class="back-link">← Back to Blog</router-link>
    <h1>{{ post.title }}</h1>
    <p class="post-date">{{ post.date }}</p>
    <div class="post-content" v-html="post.content"></div>
  </div>
  <div v-else>
    <p>Post not found.</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'BlogDetail',
  setup() {
    const post = ref(null)
    const route = useRoute()

    const fetchPost = async () => {
      const id = route.params.id
      try {
        const response = await fetch('./data/blog.json')
        const posts = await response.json()
        post.value = posts.find(p => p.id === id)
      } catch (error) {
        console.error("Failed to load blog post:", error)
      }
    }

    onMounted(fetchPost)
    watch(() => route.params.id, fetchPost)

    return { post }
  }
}
</script>

<style scoped>
.blog-detail {
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

.post-date {
  color: #888;
  margin-bottom: 2rem;
}

.post-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #bbb;
}
</style>
