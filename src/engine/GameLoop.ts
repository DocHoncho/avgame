import { getRenderer, initRenderer } from './Renderer';
import { eventBus, SessionEventType } from '../state/events';
import { useAppStore } from '../state/appStore';
import { inputManager, InputAction } from './InputManager';
import { initPlayer, getPlayer } from './Player';
import { initAimIndicator, getAimIndicator } from './AimIndicator';

// Game loop configuration
const FIXED_TIMESTEP = 1 / 60; // 60 updates per second
const MAX_FRAME_TIME = 0.25; // Maximum frame time to prevent spiral of death
const TARGET_FPS = 60; // Target frame rate

// Game state
let isRunning = false;
let lastTime = 0;
let accumulator = 0;

/**
 * Initialize the game engine
 */
export function initGameEngine() {
  // Initialize renderer
  initRenderer();

  // Initialize player
  initPlayer();

  // Initialize aim indicator
  initAimIndicator();

  // Start the game loop
  isRunning = true;
  requestAnimationFrame(gameLoop);

  // Listen for asset loading completion
  window.addEventListener('assets-loaded', () => {
    const appStore = useAppStore();
    appStore.send(SessionEventType.ASSETS_LOADED);
  });

  // Game controls
  window.addEventListener('keydown', (e) => {
    // Pause game with P key
    if (e.key === 'p') {
      isRunning = !isRunning;
      if (isRunning) {
        resumeGame();
      }
    }
  });
}

// Track frame limiting
let frameId: number | null = null;

/**
 * Main game loop with frame rate limiting
 */
function gameLoop() {
  if (!isRunning) return;

  // Schedule the next frame first with our frame rate limiting
  setTimeout(() => {
    if (isRunning) {
      frameId = requestAnimationFrame(gameLoop);
    }
  }, 1000 / TARGET_FPS);

  // Get current time for this frame
  const timestamp = performance.now();
  const now = timestamp / 1000; // Convert to seconds

  // Calculate delta time
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

  // Handle camera rotation with middle mouse button
  if (inputManager.isActionActive(InputAction.ROTATE_CAMERA)) {
    const mouseDelta = inputManager.getMouseDelta();
    // Rotate camera based on mouse X movement
    // Negative multiplier to make left movement rotate counter-clockwise
    const rotationSpeed = 0.005;
    renderer.camera.rotate(-mouseDelta.x * rotationSpeed);
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
      targetFps: TARGET_FPS,
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

  // Update player position for dev overlay
  const player = getPlayer();
  const position = player.getPosition();

  window.dispatchEvent(new CustomEvent('player-position-update', {
    detail: {
      x: position.x,
      y: position.y,
      z: position.z
    }
  }));
}

/**
 * Pause the game loop
 */
export function pauseGame() {
  isRunning = false;

  // Cancel any pending frame requests
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

/**
 * Resume the game loop
 */
export function resumeGame() {
  if (!isRunning) {
    isRunning = true;
    const now = performance.now();
    lastTime = now / 1000;
    // Start the game loop without requestAnimationFrame
    // since our gameLoop function handles its own scheduling
    gameLoop();
  }
}
