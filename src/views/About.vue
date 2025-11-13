<template>
  <div class="about">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="gradient-overlay"></div>
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="container">
        <div class="hero-content">
          <div class="profile-card">
            <div class="profile-image">
              <img src="/avatar.jpg" alt="Profile" />
              <div class="status-indicator"></div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">Raymond</h1>
              <p class="profile-title">Full Stack Developer</p>
              <div class="profile-badges">
                <span class="badge">🚀 AI Expert</span>
                <span class="badge">💡 Creative Thinker</span>
                <span class="badge">🖥️ Web Dev</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Content -->
    <section class="about-content">
      <div class="container">
        <div class="content-grid">
          <!-- Story Card -->
          <div class="content-card story-card full-width">
            <div class="card-header">
              <div class="card-icon">📖</div>
              <h2>My Story</h2>
            </div>
            <div class="card-body">
              <p class="lead-text">
                Passionate developer with a love for creating meaningful digital experiences
              </p>
              <p>
                I'm a student developer who discovered my passion for coding through building 
                contributory projects and solving real-world problems. What started as curiosity has 
                become a journey of continuous learning and growth.
              </p>
              <p>
                I believe in writing clean, maintainable code and creating user experiences 
                that are both beautiful and functional. When I'm not coding, you can find me 
                exploring new technologies, contributing to open-source projects, or sharing 
                knowledge with the developer community.
              </p>
            </div>
          </div>

          <!-- Goals Card -->
          <div class="content-card goals-card full-width">
            <div class="card-header">
              <div class="card-icon">🎯</div>
              <h2>My Goals</h2>
            </div>
            <div class="card-body">
              <div class="goals-timeline">
                <div class="timeline-item" v-for="(goal, index) in goals" :key="index">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <h3>{{ goal.title }}</h3>
                    <p>{{ goal.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interests Card -->
          <div class="content-card interests-card half-width">
            <div class="card-header">
              <div class="card-icon">🎨</div>
              <h2>Interests & Passions</h2>
            </div>
            <div class="card-body">
              <div class="interests-cloud">
                <div 
                  v-for="interest in interests" 
                  :key="interest.name"
                  class="interest-tag"
                  :style="{ 
                    fontSize: interest.size + 'px', 
                    color: interest.color,
                    transform: `rotate(${interest.rotation}deg)` 
                  }"
                >
                  <span class="interest-icon">{{ interest.icon }}</span>
                  {{ interest.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="content-card stats-card half-width">
            <div class="card-header">
              <div class="card-icon">📊</div>
              <h2>Quick Stats</h2>
            </div>
            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-item" v-for="stat in stats" :key="stat.label">
                  <div class="stat-number">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-card">
          <h2>Let's Connect</h2>
          <p>I'm always open to discussing new opportunities and interesting projects.</p>
          <div class="contact-links">
            <a href="mailto:your.email@example.com" class="contact-link">
              <span class="contact-icon">📧</span>
              <span>Raymond.dengruihan@yungu.org</span>
            </a>
            <a href="tel:+86 18368725059" class="contact-link">
              <span class="contact-icon">📞</span>
              <span>🇨🇳+86 18368725059</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      story: {
        leadText: "",
        paragraphs: []
      },
      goals: [],
      quickFacts: [],
      currentFocus: "",
      hobbies: "",
      interests: [
        { name: "Web Development", icon: "💻", size: 24, color: "#667eea", rotation: -5 },
        { name: "UI/UX Design", icon: "🎨", size: 20, color: "#f56565", rotation: 3 },
        { name: "Machine Learning", icon: "🤖", size: 18, color: "#48bb78", rotation: -2 },
        { name: "Cloud Computing", icon: "☁️", size: 19, color: "#38b2ac", rotation: -3 },
        { name: "DevOps", icon: "⚙️", size: 21, color: "#4299e1", rotation: -4 },
        { name: "Blockchain", icon: "🔗", size: 16, color: "#f6ad55", rotation: 1 }
      ],
      stats: [
        { label: "Projects Completed", value: "2+" },
        { label: "Technologies", value: "6+" },
        { label: "Happy Clients", value: "10+" },
        { label: "Caffeine", value: "∞" }
      ]
    }
  },
  async created() {
    try {
      const response = await fetch('/data/about.json');
      const data = await response.json();
      this.story = data.story;
      this.goals = data.goals;
      this.quickFacts = data.quickFacts;
      this.currentFocus = data.currentFocus;
      this.hobbies = data.hobbies;
    } catch (error) {
      console.error("Error loading about data:", error);
    }
  }
}
</script>


<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #444, #666);
  opacity: 0.1;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(to right, #444, #666);
  opacity: 0.1;
  animation: float-shape 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 70%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float-shape {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-card {
  background: rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.profile-image {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.profile-image img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #555;
  box-shadow: 0 0 30px rgba(128, 128, 128, 0.5);
}

.status-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #666;
  border-radius: 50%;
  border: 4px solid #2d2d2d;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(128, 128, 128, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(128, 128, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(128, 128, 128, 0); }
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-title {
  font-size: 1.5rem;
  color: #aaa;
  margin-bottom: 1.5rem;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(128, 128, 128, 0.2);
  color: #aaa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

/* About Content */
.about-content {
  padding: 4rem 2rem;
  background: #2d2d2d;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.full-width {
  grid-column: 1 / -1;
}

.half-width {
  grid-column: span 1;
}

.content-card {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #444, #666);
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 2rem;
  margin-right: 1rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 12px;
}

.card-header h2 {
  color: #aaa;
  font-size: 1.5rem;
  margin: 0;
}

.lead-text {
  font-size: 1.2rem;
  color: #bbb;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.card-body p {
  color: #bbb;
  line-height: 1.8;
  margin-bottom: 1rem;
}

/* Goals Timeline */
.goals-timeline {
  position: relative;
  padding-left: 2rem;
}

.goals-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #555;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #555;
  border: 3px solid #1a1a1a;
}

.timeline-content h3 {
  color: #aaa;
  margin-bottom: 0.5rem;
}

.timeline-content p {
  color: #bbb;
  margin: 0;
}

/* Interests Cloud */
.interests-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding: 2rem 0;
}

.interest-tag {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: default;
  border: 1px solid transparent;
  color: #bbb;
}

.interest-tag:hover {
  transform: translateY(-3px) scale(1.05);
  border-color: #555;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.interest-icon {
  margin-right: 0.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
  background: rgba(128, 128, 128, 0.2);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #bbb;
  font-size: 0.9rem;
}

/* Contact Section */
.contact-section {
  padding: 4rem 2rem;
  background: #1a1a1a;
}

.contact-card {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background: #2d2d2d;
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-card h2 {
  color: #aaa;
  margin-bottom: 1rem;
}

.contact-card p {
  color: #bbb;
  margin-bottom: 2rem;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.contact-link {
  display: flex;
  align-items: center;
  color: #bbb;
  text-decoration: none;
  padding: 1rem 1.5rem;
  background: #1a1a1a;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-link:hover {
  transform: translateY(-3px);
  background: #555;
  color: white;
}

.contact-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    padding: 1rem;
  }
  
  .profile-card {
    padding: 2rem 1.5rem;
  }
  
  .profile-name {
    font-size: 2rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .content-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-link {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style>
