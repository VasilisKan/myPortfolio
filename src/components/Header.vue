<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import LoginPopup from './LoginPopup.vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import githubIcon from '../assets/github.webp';
import linkedinIcon from '../assets/linkedIn.webp';
import emailIcon from '../assets/instagram.webp';

const { isLoggedIn, logout } = useAuth();
const router = useRouter();

const showMenu = ref(false);
const showLogin = ref(false);

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

function toggleMenu() { showMenu.value = !showMenu.value; }
function openLogin() { showLogin.value = true; showMenu.value = false; }
function closeLogin() { showLogin.value = false; }

async function handleLogout() {
  showMenu.value = false;
  try {
    await logout();
  } catch {
  }
  await router.push('/');
}
</script>


<template>
  <div class="headerContainer">
    <img alt="Logo" class="logo"
         src="../assets/logoMainTransparent.webp"
         width="78" height="78" />

    <div class="rightSideHeader">
      <ul class="menu" :class="{ active: showMenu }">
        <li v-for="item in menuItems" :key="item.name">
          <a :href="item.href" @click="toggleMenu">{{ item.name }}</a>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink to="/dashboard" class="menu-link" @click="toggleMenu">Dashboard</RouterLink>
        </li>
        <li class="mobile-signin">
          <button v-if="!isLoggedIn" @click="openLogin">Sign In</button>
          <button v-else @click="handleLogout">Sign Out</button>
        </li>
      </ul>

      <div class="social-icons">
        <a v-for="social in socialLinks" :key="social.name"
           :href="social.href" target="_blank" rel="noopener noreferrer"
           :title="social.name">
          <img :src="social.icon" :alt="social.name"
               class="social-icon-img" />
        </a>
      </div>

      <button v-if="!isLoggedIn"
              class="signin-btn-header desktop-signin"
              @click="openLogin">
        Sign In
      </button>
      <button v-else
              class="signin-btn-header desktop-signin"
              @click="handleLogout">
        Sign Out
      </button>

      <button class="hamburger" @click="toggleMenu"
              :class="{ active: showMenu }">
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
      </button>
    </div>
  </div>

  <LoginPopup v-if="showLogin" @close="closeLogin" />
</template>

<style scoped>
.headerContainer {
  position: relative;
  width: 100%;
  margin-top: 38px;
  margin-bottom: 138px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 26px;
  background: rgba(20,20,20,0.5);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  z-index: 100;
}

.logo {
  cursor: pointer;
  width: 78px;
  height: auto;
}

.rightSideHeader {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-right: 14px;
}

.menu {
  display: flex;
  gap: 18px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li a {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.5px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.25s ease-in-out;
}

.menu li a:hover,
.menu li .menu-link:hover {
  color: #42f5e9;
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 6px rgba(66,245,233,0.6);
}

.menu .menu-link {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.5px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.25s ease-in-out;
}

.social-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.social-icon-img {
  width: 22px;
  height: 22px;
  transition: transform 0.2s;
}

.social-icons a:hover .social-icon-img {
  transform: scale(1.35);
}

.signin-btn-header {
  font: inherit;
  font-weight: 700;
  padding: 6px 18px;
  background: linear-gradient(to right,#0199c4,#82df8b);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255,255,255,0.9);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6),0 2px 4px rgba(0,0,0,0.4);
  box-shadow:0 2px 4px rgba(0,0,0,0.2),0 4px 8px rgba(0,0,0,0.15);
}

.signin-btn-header:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow:0 4px 8px rgba(0,0,0,0.25),0 8px 16px rgba(0,0,0,0.2);
}

.mobile-signin { display: none; }
.desktop-signin { display: inline-block; }

.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index:1001;
}

.hamburger-line {
  width:24px;
  height:2px;
  background:rgba(255,255,255,0.85);
  margin:4px 0;
  transition: all .3s;
}

@media (max-width: 768px) {
  .headerContainer {
    padding: 0px 18px;
    margin-top: 20px;
    margin-bottom: 95px;
    border-radius: 22px;
  }

  .rightSideHeader {
    gap: 16px;
    padding-right: 14px;
  }

  .menu {
    display: none;
    position: absolute;
    top: calc(100% + 14px);
    right: 18px;
    background: rgba(20,20,20,0.9);
    backdrop-filter: blur(12px);
    border:1px solid rgba(255,255,255,0.05);
    border-radius:12px;
    padding:12px;
    flex-direction:column;
    gap:14px;
    box-shadow:0 8px 32px rgba(0,0,0,0.25);
    width: min(220px, calc(100vw - 36px));
  }

  .menu.active { display:flex; }

  .hamburger { display:block; }
  .hamburger.active .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
  .hamburger.active .hamburger-line:nth-child(2) { opacity: 0; }
  .hamburger.active .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

  .desktop-signin { display:none; }
  .mobile-signin { display:block; }
  .mobile-signin button {
    width:100%; background:none; border:none;
    padding:6px 10px; text-align:left;
    color:rgba(255,255,255,0.88); font-size:16px;
    border-radius:6px; cursor:pointer; transition:background .2s;
  }
  .mobile-signin button:hover { background:rgba(255,255,255,0.08); }
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;           
  border-radius: 6px;    
  background: transparent;
  transition: background 0.2s ease, transform 0.2s ease;
}
</style>
