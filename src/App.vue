<template>
  <div id="app">
    <canvas id="game-canvas"></canvas>
    <LoadingBar v-if="isLoading" :progress="loadingProgress" />
    <DevOverlay v-if="showDevOverlay" />
    <MainMenu v-if="isMainMenu" @start-game="startGame" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from './state/appStore';
import LoadingBar from './ui/LoadingBar.vue';
import DevOverlay from './ui/DevOverlay.vue';
import MainMenu from './ui/MainMenu.vue';

const appStore = useAppStore();

const loadingProgress = ref(0);
const showDevOverlay = ref(import.meta.env.DEV);

// Computed properties based on app state
const isLoading = computed(() => appStore.currentState === 'loading');
const isMainMenu = computed(() => appStore.currentState === 'mainMenu');

// Methods
const startGame = () => {
  appStore.send('START_NEW_GAME', { seed: Math.floor(Math.random() * 1000000) });
};

onMounted(() => {
  // Initialize app state
  appStore.init();
  
  // Listen for loading progress updates
  window.addEventListener('asset-progress', (e: CustomEvent) => {
    loadingProgress.value = e.detail.progress;
  });
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #0af;
  font-family: 'Courier New', monospace;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
