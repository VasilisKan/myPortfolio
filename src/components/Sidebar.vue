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
  brands.faYoutube
)

const socialData = [
  { link: "https://github.com/VasilisKan", icon: ['fab', 'github'] },
  { link: "https://facebook.com/VasilisKan", icon: ['fab', 'facebook'] },
  { link: "https://instagram.com/VasilisKan", icon: ['fab', 'instagram'] },
  { link: "https://x.com/VasilisKan", icon: ['fab', 'x-twitter'] },
  { link: "https://youtube.com/@VasilisKan", icon: ['fab', 'youtube'] }
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
  background-color: #1c1c1c;
  border-top-left-radius: 14px;  
  border-bottom-left-radius: 14px; 
  padding: 12px 6px;
  width: 80px;
  box-shadow: -2px 4px 12px rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 999;
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
  background-color: #262626;
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
  font-size: 16px;
  color: white;
  transition: color 0.3s ease;
}

.icon-only-link:hover .icon {
  color: #121212;
}
</style>
