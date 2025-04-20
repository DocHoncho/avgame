<template>
  <!-- Upper left: Stats and player position -->
  <div class="dev-overlay top-left">
    <div class="stats">
      <div class="stat">FPS: {{ stats.fps }}/{{ stats.targetFps }}</div>
      <div class="stat">Frame: {{ stats.frameTime }} ms</div>
      <div class="stat">Draws: {{ stats.drawCalls }}</div>
      <div class="stat-divider"></div>
      <div class="stat">Player X: {{ playerPos.x.toFixed(2) }}</div>
      <div class="stat">Player Y: {{ playerPos.y.toFixed(2) }}</div>
      <div class="stat">Player Z: {{ playerPos.z.toFixed(2) }}</div>
    </div>
  </div>

  <!-- Upper right: Compass and Direction Visualizer -->
  <div class="dev-overlay top-right">
    <CompassIndicator />
    <div class="visualizer-container">
      <DirectionVisualizer />
    </div>
  </div>

  <!-- Lower left: Controls -->
  <div class="dev-overlay bottom-left">
    <div class="controls">
      <div class="control">WASD - Move Player</div>
      <div class="control">Mouse - Aim</div>
      <div class="control">Middle Mouse - Rotate Camera</div>
      <div class="control">P - Pause Game</div>
      <div class="control-divider"></div>
      <div class="control debug">Debug Controls:</div>
      <div class="control debug">C - Toggle Collider Visualization</div>
      <div class="control debug">F12 - Toggle Debug Overlay</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CompassIndicator from './CompassIndicator.vue';
import DirectionVisualizer from './DirectionVisualizer.vue';

// Stats data
const stats = ref({
  fps: 0,
  frameTime: '0.00',
  drawCalls: 0
});

// Player position data
const playerPos = ref({
  x: 0,
  y: 0,
  z: 0
});

// Update stats from event
const updateStats = (e: CustomEvent) => {
  stats.value = e.detail;
};

// Update player position from event
const updatePlayerPos = (e: CustomEvent) => {
  playerPos.value = e.detail;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('dev-stats-update', updateStats as EventListener);
  window.addEventListener('player-position-update', updatePlayerPos as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('dev-stats-update', updateStats as EventListener);
  window.removeEventListener('player-position-update', updatePlayerPos as EventListener);
});
</script>

<style scoped>
.dev-overlay {
  position: absolute;
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

.top-left {
  top: 10px;
  left: 10px;
}

.top-right {
  top: 10px;
  right: 10px;
}

.bottom-left {
  bottom: 10px;
  left: 10px;
}

.stats {
  margin-bottom: 5px;
}

.stat {
  margin-bottom: 5px;
}

.stat-divider {
  height: 1px;
  background-color: #0af;
  opacity: 0.5;
  margin: 8px 0;
}

.controls {
  padding-top: 5px;
}

.control {
  margin-top: 5px;
  opacity: 0.8;
}

.control-divider {
  height: 1px;
  background-color: #0af;
  opacity: 0.5;
  margin: 8px 0;
}

.control.debug {
  color: #ff9900;
  opacity: 0.9;
}

.visualizer-container {
  margin-top: 10px;
}
</style>
