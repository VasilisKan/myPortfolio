<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Project {
  title: string
  description: string
  tags: string[]
  coverPhoto: string
  link?: string
}

const projects = ref<Project[]>([
  {
    title: "Under Construction 🚧",
    description: "This project is currently being built with blood, sweat, and excessive caffeine. Check back before the heat death of the universe.",
    tags: ["WIP", "Hope", "Caffeine"],
    coverPhoto: new URL('../assets/projectPhoto/placeholderPhoto.webp', import.meta.url).href,
    link: "#"
  },
  {
    title: "Redacted Due to Awesomeness ",
    description: "It’s gonna blow your mind. Maybe.)",
    tags: ["Classified", "🤫", "Next.js?"],
    coverPhoto: new URL('../assets/projectPhoto/placeholderPhoto.webp', import.meta.url).href,
    link: "#"
  },
  {
    title: "Loading... (Patience Required)",
    description: "The code is compiling. Or I’m napping. Hard to say. Estimated completion: between tomorrow and the year 3024.",
    tags: ["Soon™", "Maybe", "Webpack"],
    coverPhoto: new URL('../assets/projectPhoto/placeholderPhoto.webp', import.meta.url).href,
    link: "#"
  },
  {
    title: "The Schrödinger's Project 🐱",
    description: "Both amazing and non-existent until you observe it. Quantum mechanics guarantees it’ll be cool... probably.",
    tags: ["Paradox", "Uncertainty", "Vue?"],
    coverPhoto: new URL('../assets/projectPhoto/placeholderPhoto.webp', import.meta.url).href,
    link: "#"
  }
])

const rows = computed(() => {
  const result: Project[][] = []
  for (let i = 0; i < projects.value.length; i += 2) {
    result.push(projects.value.slice(i, i + 2))
  }
  return result
})
</script>

<template>
  <section class="projects-section" id="projects">
    <div class="section-header">
      <h2 class="section-title">I'm responsible for..</h2>
    </div>

    <div class="projects-grid">
      <div 
        v-for="(project, index) in projects" 
        :key="index"
        class="project-card"
        :style="{ '--delay': index * 0.1 + 's' }"
      >
        <div class="card-image">
          <img 
            :src="project.coverPhoto" 
            :alt="project.title + ' project cover'" 
            loading="lazy"
          >
          <div class="image-overlay"></div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
          </div>
          <div class="card-footer">
            <div class="tags">
              <span v-for="(tag, tagIndex) in project.tags" :key="tagIndex">{{ tag }}</span>
            </div>
            <a v-if="project.link" :href="project.link" class="project-link">
              View Project →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  border-top: 1px solid #ffffff22;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  max-width: 1200px;
  margin: 100px auto;
  padding: 0 20px;
  scroll-margin-top: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  background: linear-gradient(to right,  #92fe9d , #00c9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(0, 201, 255, 0.3);
  margin: 40px 20px;
  text-align: center;
  font-size: 32px;
  color: #e0e0e0;
  position: relative;
  margin-bottom: 60px;
}

.section-title::after {
  content: "";
  display: block;
  margin: 0.4rem auto 0;
  width: 60px;
  height: 2px;
  background-color: #ffffff22;
}

.section-subtitle {
  color: #aaa;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background: #0d0d0d;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s forwards;
  animation-delay: var(--delay);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

@keyframes fadeInUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.project-card:hover {
  transform: translateY(-10px) !important;
  box-shadow: 0 15px 30px rgba(255, 255, 255, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);
}

.card-content {
  padding: 20px;
}

.card-header h3 {
  color: #fff;
  font-size: 1.4rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.card-header p {
  color: #aaa;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  background: rgba(0, 201, 255, 0.1);
  color: #00c9ff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.project-link {
  color: #00c9ff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.project-link:hover {
  color: #92fe9d;
  transform: translateX(5px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .projects-section {
    margin: 80px auto;
  }
  .section-title{

    font-size: 28px;
    margin: 20px 0;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .card-image {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .section-title {
font-size: 28px;
margin: 20px 0;
}
  .projects-section {
    margin: 60px auto;
    padding: 0 15px;
  }
  
  .section-header {
    margin-bottom: 40px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>