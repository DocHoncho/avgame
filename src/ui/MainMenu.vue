<template>
  <div class="main-menu">
    <div class="title">AVGAME</div>
    <div class="subtitle">SYSTEM ONLINE</div>
    
    <div class="menu-options">
      <button class="menu-button" @click="$emit('start-game')">NEW SESSION</button>
      <button class="menu-button" disabled>CONTINUE</button>
      <button class="menu-button" disabled>SETTINGS</button>
    </div>
    
    <div class="version">ALPHA BUILD v0.1.0</div>
  </div>
</template>

<script setup lang="ts">
// Define emits
defineEmits(['start-game']);
</script>

<style scoped>
.main-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #0af;
  font-family: 'Courier New', monospace;
  z-index: 100;
}

.title {
  font-size: 72px;
  letter-spacing: 10px;
  margin-bottom: 10px;
  text-shadow: 0 0 20px #0af;
}

.subtitle {
  font-size: 24px;
  letter-spacing: 5px;
  margin-bottom: 60px;
  opacity: 0.8;
}

.menu-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 60px;
}

.menu-button {
  background-color: transparent;
  color: #0af;
  border: 1px solid #0af;
  padding: 15px 30px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 250px;
  text-align: center;
}

.menu-button:hover:not(:disabled) {
  background-color: rgba(0, 170, 255, 0.2);
  box-shadow: 0 0 15px #0af;
}

.menu-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.version {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 14px;
  opacity: 0.6;
}
</style>
