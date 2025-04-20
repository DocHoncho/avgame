<template>
  <div class="direction-visualizer">
    <h3>Direction Visualizer</h3>
    <div class="visualization">
      <div class="grid">
        <!-- Center point (player) -->
        <div class="player-point"></div>

        <!-- Camera direction arrow -->
        <div class="direction-arrow camera-direction"
             :style="{ transform: `rotate(${cameraAngle}deg)` }">
        </div>

        <!-- Movement direction arrows -->
        <div class="direction-arrow movement-w"
             :style="{ transform: `rotate(${wDirection}deg)` }">
          <span class="key-label">W</span>
        </div>

        <div class="direction-arrow movement-a"
             :style="{ transform: `rotate(${aDirection}deg)` }">
          <span class="key-label">A</span>
        </div>

        <div class="direction-arrow movement-s"
             :style="{ transform: `rotate(${sDirection}deg)` }">
          <span class="key-label">S</span>
        </div>

        <div class="direction-arrow movement-d"
             :style="{ transform: `rotate(${dDirection}deg)` }">
          <span class="key-label">D</span>
        </div>
      </div>
    </div>
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color camera"></div>
        <span>Camera Direction</span>
      </div>
      <div class="legend-item">
        <div class="legend-color movement"></div>
        <span>Movement Direction</span>
      </div>
    </div>
    <div class="angles">
      <div>Camera: {{ cameraAngle.toFixed(0) }}°</div>
      <div>W: {{ wDirection.toFixed(0) }}°</div>
      <div>A: {{ aDirection.toFixed(0) }}°</div>
      <div>S: {{ sDirection.toFixed(0) }}°</div>
      <div>D: {{ dDirection.toFixed(0) }}°</div>
    </div>
    <div class="vector-info">
      <div>Forward Vector:</div>
      <div>X: {{ forwardX.toFixed(2) }}, Z: {{ forwardZ.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// State
const cameraAngleDegrees = ref(0);
const forwardX = ref(0);
const forwardZ = ref(0);

// Computed properties for arrow rotations
// Camera angle is directly from the event
const cameraAngle = computed(() => cameraAngleDegrees.value);

// Movement directions based on camera angle
// W is in the same direction as the camera
const wDirection = computed(() => cameraAngleDegrees.value);

// A is 90 degrees counter-clockwise from W
const aDirection = computed(() => (cameraAngleDegrees.value + 270) % 360);

// S is 180 degrees from W
const sDirection = computed(() => (cameraAngleDegrees.value + 180) % 360);

// D is 90 degrees clockwise from W
const dDirection = computed(() => (cameraAngleDegrees.value + 90) % 360);

// Debug log for direction visualization
const logDirections = () => {
  console.log(`Direction Visualizer - Camera: ${cameraAngleDegrees.value}°, ` +
              `W: ${wDirection.value}°, A: ${aDirection.value}°, ` +
              `S: ${sDirection.value}°, D: ${dDirection.value}°`);
};

// Update camera angle and forward vector from event
const updateCameraAngle = (e: CustomEvent) => {
  cameraAngleDegrees.value = e.detail.angle;
  forwardX.value = e.detail.forwardX;
  forwardZ.value = e.detail.forwardZ;

  // Log directions when camera angle changes
  logDirections();
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('camera-angle-update', updateCameraAngle as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('camera-angle-update', updateCameraAngle as EventListener);
});
</script>

<style scoped>
.direction-visualizer {
  width: 200px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #0af;
  color: #0af;
}

h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  text-align: center;
}

.visualization {
  position: relative;
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
}

.grid {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(0, 170, 255, 0.3);
}

.player-point {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background-color: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.direction-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 4px;
  transform-origin: 0 50%;
}

.camera-direction {
  background-color: #ff3333;
  z-index: 10;
}

.camera-direction::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 8px solid #ff3333;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.movement-w, .movement-a, .movement-s, .movement-d {
  background-color: #00ff00;
  opacity: 0.7;
  z-index: 5;
}

.movement-w::after, .movement-a::after, .movement-s::after, .movement-d::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 8px solid #00ff00;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.key-label {
  position: absolute;
  right: -20px;
  top: -8px;
  font-size: 12px;
  font-weight: bold;
  color: #00ff00;
}

.legend {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}

.legend-color.camera {
  background-color: #ff3333;
}

.legend-color.movement {
  background-color: #00ff00;
}

.angles {
  font-size: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  margin-bottom: 10px;
}

.vector-info {
  font-size: 12px;
  border-top: 1px solid rgba(0, 170, 255, 0.3);
  padding-top: 5px;
}
</style>
