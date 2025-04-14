<script lang="ts" setup>
defineOptions({
  name: 'MyHeader'
});
import githubIcon from './../assets/github.png';
import linkedinIcon from '../assets/linkedin.png';
import emailIcon from '../assets/instagram.png';
// import gradientIcon from '../assets/gradient.png';

const menuItems = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/VasilisKan', icon: githubIcon },
  { name: 'LinkedIn', href: 'www.linkedin.com/in/vkanellos', icon: linkedinIcon },
  { name: 'Instagram', href: 'mailto:vasilis@kanellos.me', icon: emailIcon },
];

</script>
<template>
  <div class="headerContainer">
    <img alt="Logo" class="logo" src="../assets/logoMain.png" width="70" height="70" />

    <div class="rightSideHeader">
      <ul class="menu">
      <li v-for="item in menuItems" :key="item.name">
        <a :href="item.href">{{ item.name }}</a>
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
    </div>
  </div>
</template>

<style src="../assets/styles/header.css"></style>