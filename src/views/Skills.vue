<!-- src/views/Skills.vue -->
<template>
  <div class="skills">
    <h1>Skills & Resume</h1>
    
    <section class="skill-section">
      <h2>
        <img src="/icons/book.svg" alt="My Skillset" class="section-icon-svg" />
        My Skillset
      </h2>
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
      <h2>
        <img src="/icons/target.svg" alt="Education & Achievements" class="section-icon-svg" />
        Education & Achievements
      </h2>
      
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot education"></div>
          <div class="timeline-content">
            <div class="timeline-date">2024</div>
            <h3>Enrolled at Hangzhou Yungu High School</h3>
            <p>Began high school education with focus on technology and engineering innovation.</p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-dot award"></div>
          <div class="timeline-content">
            <div class="timeline-date">March 2025</div>
            <h3>CTB National Conference High Distinction</h3>
            <p>Awarded for outstanding achievement in Technology and Engineering Innovation at the 2024-2025 China Thinks Big (CTB) Global Youth Research Innovation Forum.</p>
            <p class="award-details">Recognized by Co-Directors Andrew Chen and Mike Yan for exceptional project work.</p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-dot conference"></div>
          <div class="timeline-content">
            <div class="timeline-date">April 2025</div>
            <h3>2050 Conference at Yunqi Town</h3>
            <p>Participated in the 2050 Conference, a global gathering for young innovators and tech enthusiasts at Yunqi Town, Hangzhou.</p>
            <p class="conference-details">Engaged with industry leaders and explored cutting-edge technology trends and future innovations.</p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-dot summer_school"></div>
          <div class="timeline-content">
            <div class="timeline-date">July 2025</div>
            <h3>UTSC Summer School Program</h3>
            <p>Attended summer program at University of Toronto Scarborough (UTSC), focusing on advanced technology and innovation studies.</p>
            <p class="education-details">Completed intensive coursework and collaborative projects with international students.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Skills',
  data() {
    return {
      skills: [],
      education: []
    }
  },
  async created() {
    try {
      const response = await fetch('/data/skills.json');
      const data = await response.json();
      this.skills = data.skillset;
      this.education = data.education;
    } catch (error) {
      console.error("Error loading skills data:", error);
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

.skill-section h2, .resume-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #aaa;
}

.section-icon-svg {
  width: 20px;
  height: 20px;
  filter: invert(1);
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
  background-color: #d4d3d3ff;
  height: 100%;
  transition: width 0.3s ease;
}

/* 时间轴样式 */
.timeline {
  position: relative;
  margin-top: 2rem;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background: linear-gradient(to bottom, #4CAF50, #FFD700, #2196F3, #9C27B0);
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.timeline-item:nth-child(1) { animation-delay: 0.2s; }
.timeline-item:nth-child(2) { animation-delay: 0.4s; }
.timeline-item:nth-child(3) { animation-delay: 0.6s; }
.timeline-item:nth-child(4) { animation-delay: 0.8s; }

.timeline-dot {
  position: absolute;
  left: -2.4rem;
  top: 0.5rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #1a1a1a;
  z-index: 1;
  transition: transform 0.3s ease;
}

.timeline-dot:hover {
  transform: scale(1.2);
}

.timeline-dot.education {
  background: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
}

.timeline-dot.award {
  background: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
}

.timeline-dot.conference {
  background: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}

.timeline-dot.summer_school {
  background: #9C27B0;
  box-shadow: 0 0 0 3px rgba(204, 0, 255, 0.3);
}

.timeline-content {
  background: #333;
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.timeline-content:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #333;
}

.timeline-date {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.timeline-item:nth-child(1) .timeline-date { color: #4CAF50; }
.timeline-item:nth-child(2) .timeline-date { color: #FFD700; }
.timeline-item:nth-child(3) .timeline-date { color: #2196F3; }
.timeline-item:nth-child(4) .timeline-date { color: #9C27B0; }

.timeline-content h3 {
  margin-bottom: 0.5rem;
  color: #fff;
}

.timeline-content p {
  margin-bottom: 0.5rem;
  color: #ccc;
  line-height: 1.5;
}

.award-details, .conference-details, .education-details {
  margin-top: 1rem;
  color: #aaa;
  font-size: 0.9rem;
  font-style: italic;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-dot {
    left: -1.9rem;
  }
  
  .timeline-content {
    padding: 1rem;
  }
}
</style>
