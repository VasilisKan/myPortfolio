<script lang="ts" setup>
defineOptions({ name: 'MySidebar' })
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import * as brands from '@fortawesome/free-brands-svg-icons'

library.add(
  brands.faGithub,
  brands.faFacebook,
  brands.faInstagram,
  brands.faXTwitter,
)

const socialData = [
  { link: "https://github.com/VasilisKan", icon: ['fab', 'github'] },
  { link: "#", icon: ['fab', 'facebook'] },
  { link: "#", icon: ['fab', 'instagram'] },
  { link: "#", icon: ['fab', 'x-twitter'] },
]
</script>

<template>
  <div class="sidebar-wrapper">
    <ul class="icon-only-list">
      <li v-for="(item, index) in socialData" :key="index">
        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="icon-only-link">
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
  padding: 10px 4px;
  width: 60px;
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
  width: 40px;
  height: 40px;
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
  font-size: 15px;
  color: white;
  transition: color 0.3s ease;
}

.icon-only-link:hover .icon {
  color: #121212;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 56px;
    padding: 8px 3px;
  }
  
  .icon-only-link {
    width: 36px;
    height: 36px;
  }
  
  .icon {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    margin-top: 10px;
    width: 60px;
    padding: 6px 2px;
  }
  
  .icon-only-link {
    width: 34px;
    height: 34px;
  }
  
  .icon {
    font-size: 16px;
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