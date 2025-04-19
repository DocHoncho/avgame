import { getRenderer, initRenderer } from './Renderer';
import { eventBus, SessionEventType } from '../state/events';
import { useAppStore } from '../state/appStore';
import { inputManager } from './InputManager';
import { initPlayer, getPlayer } from './Player';
import { initAimIndicator, getAimIndicator } from './AimIndicator';

// Game loop configuration
const FIXED_TIMESTEP = 1 / 60; // 60 updates per second
const MAX_FRAME_TIME = 0.25; // Maximum frame time to prevent spiral of death

// Game state
let isRunning = false;
let lastTime = 0;
let accumulator = 0;

// Auto-rotation for demo (disabled by default now that we have player movement)
let autoRotate = false;
const ROTATION_SPEED = 0.005;

/**
 * Initialize the game engine
 */
export function initGameEngine() {
  // Initialize renderer
  const renderer = initRenderer();

  // Initialize player
  const player = initPlayer();

  // Initialize aim indicator
  const aimIndicator = initAimIndicator();

  // Start the game loop
  isRunning = true;
  requestAnimationFrame(gameLoop);

  // Listen for asset loading completion
  window.addEventListener('assets-loaded', () => {
    const appStore = useAppStore();
    appStore.send(SessionEventType.ASSETS_LOADED);
  });

  // Camera rotation controls
  window.addEventListener('keydown', (e) => {
    // Toggle auto-rotation with R key
    if (e.key === 'r') {
      autoRotate = !autoRotate;
    }

    // Snap camera rotation with Q and E keys
    if (e.key === 'q') {
      const renderer = getRenderer();
      // Rotate to the next cardinal direction counter-clockwise
      const currentAngle = renderer.camera.getRotationAngle();
      const cardinalIndex = Math.round((Math.PI - currentAngle) / (Math.PI / 2)) % 4;
      const nextCardinalIndex = (cardinalIndex + 1) % 4;
      renderer.camera.snapToCardinal(nextCardinalIndex);
    } else if (e.key === 'e') {
      const renderer = getRenderer();
      // Rotate to the next cardinal direction clockwise
      const currentAngle = renderer.camera.getRotationAngle();
      const cardinalIndex = Math.round((Math.PI - currentAngle) / (Math.PI / 2)) % 4;
      const nextCardinalIndex = (cardinalIndex + 3) % 4; // +3 is equivalent to -1 in modulo 4
      renderer.camera.snapToCardinal(nextCardinalIndex);
    }
  });
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
  // Update input manager
  inputManager.update(dt);

  // Update player
  const player = getPlayer();
  player.update(dt);

  // Update aim indicator
  const aimIndicator = getAimIndicator();
  aimIndicator.update();

  // Update camera to follow player
  const renderer = getRenderer();
  const playerPos = player.getPosition();
  renderer.camera.setTarget(playerPos.x, playerPos.y, playerPos.z);

  // Optional camera rotation in demo mode
  if (autoRotate) {
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
 * Update the developer overlay with performance stats and camera info
 */
function updateDevOverlay(stats: any) {
  // Calculate FPS (simple moving average)
  const fps = stats.frameTime > 0 ? Math.round(1000 / stats.frameTime) : 0;

  // Update stats event for the Vue component to consume
  window.dispatchEvent(new CustomEvent('dev-stats-update', {
    detail: {
      fps,
      frameTime: stats.frameTime.toFixed(2),
      drawCalls: stats.drawCalls
    }
  }));

  // Update camera angle for compass indicator
  const renderer = getRenderer();
  const cameraAngle = renderer.camera.getRotationAngle();
  // Convert radians to degrees and normalize to 0-360 range
  const angleDegrees = ((cameraAngle * 180 / Math.PI) % 360 + 360) % 360;

  window.dispatchEvent(new CustomEvent('camera-angle-update', {
    detail: {
      angle: angleDegrees
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
