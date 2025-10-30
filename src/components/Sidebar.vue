<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import * as brands from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

defineOptions({ name: 'MySidebar' })

library.add(
  brands.faGithub,
  brands.faLinkedin,
  brands.faInstagram,
  faEnvelope,
)

const socialData = [
  { label: 'GitHub', link: 'https://github.com/VasilisKan', icon: ['fab', 'github'] },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/vkanellos', icon: ['fab', 'linkedin'] },
  { label: 'Instagram', link: 'https://www.instagram.com/vasilis.kanelos', icon: ['fab', 'instagram'] },
  { label: 'Email', link: 'mailto:vasilis@kanellos.me', icon: ['fas', 'envelope'] },
]
</script>

<template>
  <div class="sidebar-wrapper">
    <ul class="icon-only-list">
      <li v-for="item in socialData" :key="item.label">
        <a
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="item.label"
          class="icon-only-link"
        >
          <font-awesome-icon :icon="item.icon" class="icon" />
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
.sidebar-wrapper {
  position: fixed;
  top: 50%;
  right: 0; 
  transform: translateY(-50%);
  background-color: rgba(28, 28, 28, 0.9);
  backdrop-filter: blur(8px);
  border-top-left-radius: 12px;  
  border-bottom-left-radius: 12px; 
  padding: 14px 6px;
  width: 72px;
  box-shadow: -2px 4px 12px rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 999;
  transition: all 0.3s ease;
}

.icon-only-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.icon-only-link {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: rgba(38, 38, 38, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.icon-only-link:hover {
  background-color: #00c9ff;
  box-shadow: 0 0 10px rgba(0, 201, 255, 0.5);
  transform: scale(1.1);
}

.icon {
  font-size: 18px;
  color: white;
  transition: color 0.3s ease;
}

.icon-only-link:hover .icon {
  color: #121212;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 64px;
    padding: 10px 4px;
  }
  
  .icon-only-link {
    width: 40px;
    height: 40px;
  }
  
  .icon {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    margin-top: 10px;
    width: 58px;
    padding: 6px 2px;
  }
  
  .icon-only-link {
    width: 34px;
    height: 34px;
  }
  
  .icon {
    font-size: 15px;
  }
}

@media (hover: none) {
  .icon-only-link:hover {
    background-color: rgba(38, 38, 38, 0.8);
    box-shadow: none;
    transform: none;
  }
  
  .icon-only-link:active {
    background-color: #00c9ff;
    box-shadow: 0 0 10px rgba(0, 201, 255, 0.5);
    transform: scale(1.1);
  }
}
</style>
