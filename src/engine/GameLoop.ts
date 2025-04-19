import { getRenderer, initRenderer } from './Renderer';
import { eventBus, SessionEventType } from '../state/events';
import { useAppStore } from '../state/appStore';

// Game loop configuration
const FIXED_TIMESTEP = 1 / 60; // 60 updates per second
const MAX_FRAME_TIME = 0.25; // Maximum frame time to prevent spiral of death

// Game state
let isRunning = false;
let lastTime = 0;
let accumulator = 0;

// Auto-rotation for demo
let autoRotate = true;
const ROTATION_SPEED = 0.005;

/**
 * Initialize the game engine
 */
export function initGameEngine() {
  // Initialize renderer
  const renderer = initRenderer();
  
  // Start the game loop
  isRunning = true;
  requestAnimationFrame(gameLoop);
  
  // Listen for asset loading completion
  window.addEventListener('assets-loaded', () => {
    const appStore = useAppStore();
    appStore.send(SessionEventType.ASSETS_LOADED);
  });
  
  // Debug controls
  if (import.meta.env.DEV) {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r') {
        autoRotate = !autoRotate;
      }
    });
  }
}

/**
 * Main game loop
 */
function gameLoop(timestamp: number) {
  if (!isRunning) return;
  
  // Calculate delta time
  const now = timestamp / 1000; // Convert to seconds
  const deltaTime = Math.min(now - lastTime, MAX_FRAME_TIME);
  lastTime = now;
  
  // Accumulate time for fixed updates
  accumulator += deltaTime;
  
  // Run fixed updates
  while (accumulator >= FIXED_TIMESTEP) {
    fixedUpdate(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }
  
  // Render with interpolation
  render(accumulator / FIXED_TIMESTEP);
  
  // Schedule next frame
  requestAnimationFrame(gameLoop);
}

/**
 * Fixed update step (game logic)
 */
function fixedUpdate(dt: number) {
  // This is where game logic would run at a fixed timestep
  // For now, just rotate the camera in demo mode
  if (autoRotate) {
    const renderer = getRenderer();
    renderer.rotateCamera(ROTATION_SPEED);
  }
}

/**
 * Render step
 */
function render(interpolation: number) {
  const renderer = getRenderer();
  renderer.render();
  
  // Update FPS counter
  updateDevOverlay(renderer.getStats());
}

/**
 * Update the developer overlay with performance stats
 */
function updateDevOverlay(stats: any) {
  // Calculate FPS (simple moving average)
  const fps = stats.frameTime > 0 ? Math.round(1000 / stats.frameTime) : 0;
  
  // Update custom event for the Vue component to consume
  window.dispatchEvent(new CustomEvent('dev-stats-update', {
    detail: {
      fps,
      frameTime: stats.frameTime.toFixed(2),
      drawCalls: stats.drawCalls
    }
  }));
}

/**
 * Pause the game loop
 */
export function pauseGame() {
  isRunning = false;
}

/**
 * Resume the game loop
 */
export function resumeGame() {
  if (!isRunning) {
    isRunning = true;
    lastTime = performance.now() / 1000;
    requestAnimationFrame(gameLoop);
  }
}
