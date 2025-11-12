
<!-- src/views/Skills.vue -->
<template>
  <div class="skills">
    <h1>Skills & Resume</h1>
    
    <section class="skill-section">
      <h2>My Skillset</h2>
      <div class="skills-grid">
        <div class="skill-item" v-for="skill in skills" :key="skill.name">
          <h3>{{ skill.name }}</h3>
          <div class="skill-bar">
            <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2>Education & Achievements</h2>
      <p>Details about my education and awards will go here...</p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Skills',
  data() {
    return {
      skills: [
        { name: 'JavaScript (ES6+)', level: 85 },
        { name: 'Vue.js', level: 80 },
        { name: 'HTML5 & CSS3', level: 90 },
        { name: 'Git & GitHub', level: 75 }
      ]
    }
  }
}
</script>

<style scoped>
.skills {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

.skill-section, .resume-section {
  margin-bottom: 3rem;
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 12px;
}

.skills-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}

.skill-item h3 {
  margin-bottom: 0.5rem;
  color: #aaa;
}

.skill-bar {
  background-color: #444;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.skill-progress {
  background-color: #777;
  height: 100%;
  transition: width 0.3s ease;
}
</style>
