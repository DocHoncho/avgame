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
    if (e.key === 'q' || e.key === 'e') {
      const renderer = getRenderer();
      const currentAngle = renderer.camera.getRotationAngle();

      // Determine current cardinal direction
      // East = 0, North = PI/2, West = PI, South = 3PI/2
      let currentCardinal = 0; // Default to East

      // Find the closest cardinal direction based on our coordinate system
      // North = PI, East = PI/2, South = 0, West = 3PI/2
      const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (normalizedAngle >= Math.PI * 0.75 && normalizedAngle < Math.PI * 1.25) {
        currentCardinal = 0; // North
      } else if (normalizedAngle >= Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75) {
        currentCardinal = 1; // East
      } else if (normalizedAngle < Math.PI * 0.25 || normalizedAngle >= Math.PI * 1.75) {
        currentCardinal = 2; // South
      } else {
        currentCardinal = 3; // West
      }

      // Calculate next cardinal direction
      let nextCardinal;
      if (e.key === 'q') {
        // Counter-clockwise: North -> West -> South -> East -> North
        nextCardinal = (currentCardinal + 3) % 4; // +3 is equivalent to -1 in modulo 4
      } else { // e.key === 'e'
        // Clockwise: North -> East -> South -> West -> North
        nextCardinal = (currentCardinal + 1) % 4;
      }

      // Snap to the next cardinal direction
      renderer.camera.snapToCardinal(nextCardinal);

      // Debug output
      console.log(`Rotating from ${['North', 'East', 'South', 'West'][currentCardinal]} to ${['North', 'East', 'South', 'West'][nextCardinal]}`);
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
