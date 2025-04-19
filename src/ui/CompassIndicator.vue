<template>
  <div class="compass-container">
    <div class="compass">
      <div class="compass-arrow" :style="{ transform: `rotate(${rotation}deg)` }"></div>
      <div class="compass-labels">
        <div class="compass-label north">N</div>
        <div class="compass-label east">E</div>
        <div class="compass-label south">S</div>
        <div class="compass-label west">W</div>
      </div>
    </div>
    <div class="compass-info">
      <div>Angle: {{ angle.toFixed(0) }}°</div>
      <div>Facing: {{ direction }}</div>
      <div>Rad: {{ (angle * Math.PI / 180).toFixed(2) }}</div>
      <div>Cardinal: {{ getCardinalDirection() }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// Props
const props = defineProps({
  initialAngle: {
    type: Number,
    default: 0
  }
});

// State
const angle = ref(props.initialAngle);
const rotation = computed(() => -angle.value); // Negative because we want to rotate the arrow, not the compass

// Computed direction
const direction = computed(() => {
  const normalizedAngle = ((angle.value % 360) + 360) % 360;

  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) {
    return 'East';
  } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
    return 'North-East';
  } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
    return 'North';
  } else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
    return 'North-West';
  } else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
    return 'West';
  } else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
    return 'South-West';
  } else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) {
    return 'South';
  } else {
    return 'South-East';
  }
});

// Get cardinal direction (North, East, South, West) based on angle
function getCardinalDirection() {
  const normalizedAngle = ((angle.value % 360) + 360) % 360;

  // Determine which cardinal direction is closest
  if (normalizedAngle >= 45 && normalizedAngle < 135) {
    return 'North';
  } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
    return 'West';
  } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
    return 'South';
  } else {
    return 'East';
  }
}

// Update angle from event
const updateAngle = (e: CustomEvent) => {
  angle.value = e.detail.angle;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('camera-angle-update', updateAngle as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('camera-angle-update', updateAngle as EventListener);
});
</script>

<style scoped>
.compass-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.compass {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #0af;
  background-color: rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
}

.compass-arrow {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 25px solid #ff3333;
  transform-origin: 50% 25px;
  margin-left: -6px;
}

.compass-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: bold;
}

.compass-label {
  position: absolute;
  text-align: center;
  width: 20px;
  margin-left: -10px;
  color: #0af;
}

.north {
  top: 2px;
  left: 50%;
}

.east {
  top: 50%;
  right: 2px;
  margin-top: -6px;
  margin-left: 0;
  margin-right: -10px;
}

.south {
  bottom: 2px;
  left: 50%;
}

.west {
  top: 50%;
  left: 2px;
  margin-top: -6px;
  margin-left: -10px;
}

.compass-info {
  font-size: 12px;
  text-align: center;
}
</style>
