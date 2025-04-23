<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({
  name: 'MyHeader'
});
import githubIcon from './../assets/github.webp';
import linkedinIcon from '../assets/linkedIn.webp';
import emailIcon from '../assets/instagram.webp';

const menuItems = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/VasilisKan', icon: githubIcon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/vkanellos', icon: linkedinIcon },
  { name: 'Instagram', href: 'mailto:vasilis@kanellos.me', icon: emailIcon },
];

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};
</script>

<template>
  <div class="headerContainer">
    <img alt="Logo" class="logo" src="../assets/logoMain.webp" width="70" height="70" />

    <div class="rightSideHeader">
      <ul class="menu" :class="{ 'active': showMenu }">
        <li v-for="item in menuItems" :key="item.name">
          <a :href="item.href" @click="toggleMenu">{{ item.name }}</a>
        </li>
      </ul>

      <div class="social-icons">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          :title="social.name"
        >
          <img :src="social.icon" :alt="social.name" class="social-icon-img" />
        </a>
      </div>

      <button class="hamburger" @click="toggleMenu" :class="{ 'active': showMenu }">
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
      </button>
    </div>
  </div>
</template>

<style>
.headerContainer {
  position: relative;
  width: 100%;
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  background-color: rgba(20, 20, 20, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  z-index: 100;
}

.rightSideHeader {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu {
  display: flex;
  gap: 24px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.5px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.25s ease-in-out;
}

.menu li a:hover {
  color: #42f5e9;
  background-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 6px #42f5e999;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icon-img {
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}

.social-icons a:hover .social-icon-img {
  transform: scale(1.4);
}

.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.85);
  margin: 4px 0;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .headerContainer {
    padding: 0px 15px;
    margin-top: 15px;
    border-radius: 16px;
  }

  .rightSideHeader {
    flex-direction: row;
    gap: 10px;
  }

  .menu {
    display: none;
    position: absolute;
    top: calc(100% + 10px);
    right: 20px;
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 10px;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  }

  .menu.active {
    display: flex;
  }

  .hamburger {
    display: block;
  }

  .hamburger.active .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .hamburger.active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
  }
  .social-icons {
    display: flex;;
    margin: 0;

  }
}
</style>