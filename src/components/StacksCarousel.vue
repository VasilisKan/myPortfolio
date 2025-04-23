<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import JestIcon from './../assets/stacks/Jest.svg'
import PostgresIcon from './../assets/stacks/PostgreSQL.svg'
import MySQLIcon from './../assets/stacks/MySQL.svg'
import MSSQLIcon from './../assets/stacks/MSSQL.svg'
import SQLiteIcon from './../assets/stacks/SQLite.svg'
import HadoopIcon from './../assets/stacks/Hadoop.svg'
import DotNetIcon from './../assets/stacks/DotNet.svg'
import BlazorIcon from './../assets/stacks/Blazor.svg'
import FastAPIIcon from './../assets/stacks/FastAPI.svg'
import TraefikIcon from './../assets/stacks/Traefik.svg'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGithub,
  faVuejs,
  faReact,
  faJs,
  faNode,
  faAngular,
  faPython,
  faAws,
  faLinux,
  faGit,
  faJenkins,
  faHtml5,
  faCss3,
  faBootstrap,
  faDocker
} from '@fortawesome/free-brands-svg-icons'

import {
  faDatabase,
  faCloud,
  faCogs,
  faShieldAlt,
  faCube,
  faBoxesStacked,
  faServer,
  faCode
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGithub,
  faVuejs,
  faReact,
  faJs,
  faNode,
  faAngular,
  faPython,
  faAws,
  faLinux,
  faGit,
  faJenkins,
  faHtml5,
  faCss3,
  faBootstrap,
  faDocker,
  faDatabase,
  faCloud,
  faCogs,
  faShieldAlt,
  faCube,
  faBoxesStacked,
  faServer,
  faCode
)

// Define type for stack item
interface Stack {
  type: 'fa' | 'svg'
  icon: any 
  name: string
}

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

const rawStacks: Stack[] = [
  { type: 'fa', icon: ['fab', 'python'], name: 'Python' },
  { type: 'fa', icon: ['fab', 'node'], name: 'Node.js' },
  { type: 'fa', icon: ['fab', 'js'], name: 'JavaScript' },
  { type: 'fa', icon: ['fab', 'react'], name: 'React' },
  { type: 'fa', icon: ['fab', 'vuejs'], name: 'Vue.js' },
  { type: 'fa', icon: ['fab', 'angular'], name: 'Angular' },
  { type: 'fa', icon: ['fab', 'github'], name: 'GitHub' },
  { type: 'fa', icon: ['fab', 'git'], name: 'Git' },
  { type: 'fa', icon: ['fab', 'jenkins'], name: 'Jenkins' },
  { type: 'fa', icon: ['fab', 'aws'], name: 'AWS' },
  { type: 'fa', icon: ['fab', 'linux'], name: 'Linux' },
  { type: 'fa', icon: ['fab', 'html5'], name: 'HTML5' },
  { type: 'fa', icon: ['fab', 'css3'], name: 'CSS3' },
  { type: 'fa', icon: ['fab', 'bootstrap'], name: 'Bootstrap' },
  { type: 'fa', icon: ['fab', 'docker'], name: 'Docker' },
  { type: 'svg', icon: JestIcon, name: 'Jest' },
  { type: 'svg', icon: PostgresIcon, name: 'PostgreSQL' },
  { type: 'svg', icon: MySQLIcon, name: 'MySQL' },
  { type: 'svg', icon: MSSQLIcon, name: 'MSSQL' },
  { type: 'svg', icon: SQLiteIcon, name: 'SQLite' },
  { type: 'svg', icon: HadoopIcon, name: 'Hadoop' },
  { type: 'svg', icon: DotNetIcon, name: '.NET API' },
  { type: 'svg', icon: BlazorIcon, name: 'Blazor' },
  { type: 'svg', icon: FastAPIIcon, name: 'FastAPI' },
  { type: 'svg', icon: TraefikIcon, name: 'Traefik' }
]

const stacks = shuffleArray(rawStacks)
</script>

<template>
  <h2 class="stacksTitle">Tech stack</h2>

  <div class="carousel-wrapper">
    <div class="carousel">
      <ul class="stack-list">
        <li v-for="(stack, index) in stacks.concat(stacks)" :key="index">
          <template v-if="stack.type === 'fa'">
            <font-awesome-icon :icon="stack.icon" class="stack-icon" />
          </template>
          <template v-else-if="stack.type === 'svg'">
            <img :src="stack.icon" :alt="stack.name" class="stack-icon svg-icon" />
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>


<style>
.stacksTitle {
  margin: 40px  20px;
    text-align: center;
    font-size: 32px;
    color: #e0e0e0;
    font-weight: 700;
    position: relative;
}

.stacksTitle::after {
  content: "";
  display: block;
  margin: 0.4rem auto 0; 
  width: 60px;
  height: 2px;
  background-color: #ffffff22; 
}

.carousel-wrapper {
  padding: 25px 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 12px;
}

.carousel {
  width: 100%;
  overflow: visible;
  position: relative;
}

.stack-list {
  display: flex;
  gap: 30px;
  animation: scroll 40s linear infinite;
  list-style: none;
  padding: 0;
  margin: 0;
  width: max-content;
}
.svg-icon {
  height: 45px;
  width: 45px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: brightness(0) invert(1);
}


.svg-icon:hover {
  transform: scale(1.4);
  z-index: 9000;
}
.stack-icon {
  color: white;
  font-size: 45px;
  transition: transform 0.3s;
}

.stack-icon:hover {
  transform: scale(1.4);
  z-index: 9000;
  overflow: visible;
}

/* Infinite horizontal scroll animation */
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.carousel-wrapper:hover .stack-list {
  animation-play-state: paused;
}

@media  (max-width: 768px) {  
  .stacksTitle {
    font-size: 28px;
    margin: 20px 0;
  }
  .svg-icon {
  height: 40px;
  width: 40px;
}
}

</style>
