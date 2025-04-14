<script lang="ts" setup>
import { ref, computed } from 'vue'

// Define the project interface
interface Project {
  front: string;
  back: string;
}

const projects = ref<Project[]>([
  { front: "TestContentFront1", backSubtitle:"That is a test project", back: "Project1", coverPhoto : './../assets/projectPhoto/project2.jpg' },
  { front: "TestContentFront2", backSubtitle:"That is a test project", back: "Project2", coverPhoto : './../assets/projectPhoto/project2.jpg' },
  { front: "TestContentFront3", backSubtitle:"That is a test project", back: "Project3", coverPhoto : './../assets/projectPhoto/project2.jpg' },
  { front: "TestContentFront4", backSubtitle:"That is a test project", back: "Project4", coverPhoto : './../assets/projectPhoto/project2.jpg' }
]);

const rows = computed(() => {
  const result: Project[][] = [];
  for (let i = 0; i < projects.value.length; i += 2) {
    result.push(projects.value.slice(i, i + 2));
  }
  return result;
});

const getCardWidth = (rowIndex: number, cardIndex: number): string => {

  if (rowIndex % 2 === 0) {
    return cardIndex === 0 ? "55%" : "45%";
  } else {
    return cardIndex === 0 ? "45%" : "55%";
  }
};
</script>

<template>
  <div class="projects-full-wrapper">
    <!-- Projects Title -->
    <h2 class="projectsTitle">What I've made..</h2>

    <!-- Projects container -->
    <div class="projects-wrapper">
      <!-- Loop through rows -->
      <div
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="projects-row"
        :class="'row-' + (rowIndex + 1)"
      >
        <!-- Loop through each project in the row with dynamic width -->
        <div
          v-for="(project, cardIndex) in row"
          :key="cardIndex"
          class="card"
          :style="{ width: getCardWidth(rowIndex, cardIndex) }"
        >
          <div class="content">
            <div class="back">
              <div class="back-content">
                <div class="coverPhoto">
                    <img :src="project.coverPhoto" alt="coverPhoto">
                </div>
                <div class="backTitleContainer">
                    <h2>{{ project.back }}</h2>
                    <h4>{{ project.backSubtitle }}</h4>
                </div>
              </div>
            </div>
            <div class="front">
              <div class="front-content">
                <h1>{{ project.front }}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.projects-full-wrapper {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Play', sans-serif;
}

.projectsTitle {
    margin: 40px 20px;
  text-align: center;
  font-size: 32px;
  color: #e0e0e0;
  font-weight: 700;
  position: relative;
}

.projectsTitle::after {
  content: "";
  display: block;
  margin: 0.4rem auto 0;
  width: 60px;
  height: 2px;
  background-color: #ffffff22;
  border-radius: 2px;
}

.projects-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3em;
  margin-top: 80px;
}

.projects-row {
  display: flex;
  flex-direction: row;
  gap: 2em;
}

.card {
  overflow: visible;
  height: 22em;
}

.content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 300ms;
  box-shadow: 0px 0px 3px 1px #ffffff5b;
  border-radius: 5px;
  position: relative;
}

.card:hover .content {
  transform: rotateY(180deg);
}

.front, .back {
  background-color: #151515;
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 5px;
  overflow: hidden;
}

.back {
  display: flex;
  justify-content: center;
  align-items: center;
}

.back::before {
  position: absolute;
  content: ' ';
  display: block;
  width: 40%;
  height: 400%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8), transparent);
  animation: rotation_481 7000ms infinite linear;
}

.back-content {
  position: absolute;
  width: 99%;
  height: 99%;
  background-color: #111;
  border-radius: 5px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}
.coverPhoto {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 5px;
}
.back-content img {  
  width: 90%;
  height: 90%;
  object-fit: cover;
  border-radius: 5px;
  border-top: #e0e0e054 1px solid;
  border-bottom: #e0e0e054 1px solid;

}

.backTitleContainer{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

@keyframes rotation_481 {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.front {
  transform: rotateY(180deg);
  color: white;
}

.front .front-content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.front-content .badge {
  background-color: #00000055;
  padding: 2px 10px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
  width: fit-content;
}

/* Optional: Floating animation for demonstration */
@keyframes floating {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
