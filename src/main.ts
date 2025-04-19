import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { initGameEngine } from './engine/GameLoop';

// Create Vue app
const app = createApp(App);

// Add Pinia store
app.use(createPinia());

// Mount the app
app.mount('#app');

// Initialize game engine after Vue is mounted
initGameEngine();

// Expose for debugging in development
if (import.meta.env.DEV) {
  // Will add debug hooks here
}
