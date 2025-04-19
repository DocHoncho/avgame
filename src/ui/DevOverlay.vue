<template>
  <div class="dev-overlay">
    <div class="stats">
      <div class="stat">FPS: {{ stats.fps }}</div>
      <div class="stat">Frame: {{ stats.frameTime }} ms</div>
      <div class="stat">Draws: {{ stats.drawCalls }}</div>
    </div>
    <div class="controls">
      <div class="control">WASD - Move Player</div>
      <div class="control">Mouse - Aim</div>
      <div class="control">Q/E - Rotate Camera 90°</div>
      <div class="control">R - Toggle Auto-Rotation</div>
      <div class="control">P - Pause Game</div>
    </div>
    <CompassIndicator />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CompassIndicator from './CompassIndicator.vue';

// Stats data
const stats = ref({
  fps: 0,
  frameTime: '0.00',
  drawCalls: 0
});

// Update stats from event
const updateStats = (e: CustomEvent) => {
  stats.value = e.detail;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('dev-stats-update', updateStats as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('dev-stats-update', updateStats as EventListener);
});
</script>

<style scoped>
.dev-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #0af;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 10px;
  border: 1px solid #0af;
  box-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
  z-index: 1000;
  user-select: none;
}

.stats {
  margin-bottom: 10px;
}

.stat {
  margin-bottom: 5px;
}

.controls {
  border-top: 1px solid #0af;
  padding-top: 5px;
}

.control {
  margin-top: 5px;
  opacity: 0.8;
}
</style>
