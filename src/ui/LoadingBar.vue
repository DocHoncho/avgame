<template>
  <div class="loading-container">
    <div class="loading-text">LOADING SYSTEM</div>
    <div class="loading-bar-container">
      <div class="loading-bar" :style="{ width: `${progress * 100}%` }"></div>
    </div>
    <div class="loading-percentage">{{ Math.floor(progress * 100) }}%</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number;
}>();
</script>

<style scoped>
.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 500px;
  color: #0af;
  text-align: center;
  font-family: 'Courier New', monospace;
  z-index: 100;
}

.loading-text {
  font-size: 24px;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #0af;
}

.loading-bar-container {
  height: 4px;
  background-color: rgba(0, 170, 255, 0.2);
  border: 1px solid #0af;
  box-shadow: 0 0 10px #0af;
  margin-bottom: 10px;
}

.loading-bar {
  height: 100%;
  background-color: #0af;
  transition: width 0.3s ease;
}

.loading-percentage {
  font-size: 16px;
  letter-spacing: 1px;
}
</style>
