import * as THREE from 'three';
import { inputManager } from './InputManager';
import { getRenderer } from './Renderer';

/**
 * Player class
 *
 * Represents the player entity in the game.
 * Handles movement, collision, and player state.
 */
export class Player {
  // Player mesh
  private mesh: THREE.Mesh;

  // Physics properties
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private acceleration: THREE.Vector3;
  private speed: number = 24.0; // Increased for faster movement
  private maxSpeed: number = 15.0; // Increased max speed
  private friction: number = 0.8; // Slightly reduced for more responsive movement

  // Collision properties
  private radius: number = 0.4;
  private height: number = 1.8;

  constructor() {
    // Initialize position and physics vectors
    // Start at the center of the room
    this.position = new THREE.Vector3(0, 0.9, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);

    // Create player mesh (capsule shape)
    this.createMesh();
  }

  /**
   * Create the player mesh
   */
  private createMesh(): void {
    // Create a capsule-like shape using a cylinder with hemispheres
    const geometry = new THREE.CapsuleGeometry(this.radius, this.height - this.radius * 2, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x003366,
      metalness: 0.7,
      roughness: 0.3
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    // Set initial position
    this.mesh.position.copy(this.position);

    // Add to scene
    const renderer = getRenderer();
    renderer.scene.add(this.mesh);
  }

  /**
 * Convert WASD axes into a world‑space X Z vector
 * that is always relative to the current camera.
 */
  private transformInputAxes(inputX: number, inputY: number): { x: number, z: number } {
    const renderer = getRenderer();
    const cam = renderer.camera.camera;           // THREE.PerspectiveCamera

    // ----- 1. forward vector (where the camera looks) -----
    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);    // returns a UNIT vector
    forward.y = 0;                     // flatten to ground plane
    forward.normalize();               // re‑normalise after y‑kill

    // ----- 2. right vector  (90° clockwise from forward) -----
    // right = forward × worldUp
    const right = new THREE.Vector3()
      .copy(forward)
      .cross(new THREE.Vector3(0, 1, 0))   // (x,z) → (x,0,z)
      .normalize();

    // ----- 3. combine with input axes -----
    // W/S drive along forward,  A/D along right
    const move = right.multiplyScalar(inputX)     // D = +1, A = –1
      .add(forward.multiplyScalar(inputY)); // W = +1, S = –1

    // Stop diagonals from being √2 faster
    if (move.lengthSq() > 1) move.normalize();

    // Debug log for movement directions (only when there's actual input)
    if (inputX !== 0 || inputY !== 0) {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.05) { // Log roughly 5% of the time when moving
        const cameraAngle = renderer.camera.getRotationAngle();
        console.log(`Input: (${inputX.toFixed(2)}, ${inputY.toFixed(2)}), ` +
                    `Camera Angle: ${(cameraAngle * 180 / Math.PI).toFixed(0)}°, ` +
                    `Forward: (${forward.x.toFixed(2)}, ${forward.z.toFixed(2)}), ` +
                    `Right: (${right.x.toFixed(2)}, ${right.z.toFixed(2)}), ` +
                    `Movement: (${move.x.toFixed(2)}, ${move.z.toFixed(2)})`);
      }
    }

    return { x: move.x, z: move.z };
  }

  /**
   * Update player state
   */
  public update(deltaTime: number): void {
    // Get input axes
    const { x: moveX, y: moveY } = inputManager.getMovementAxes();

    // Transform input axes based on camera rotation
    const { x: worldX, z: worldZ } = this.transformInputAxes(moveX, moveY);

    // Apply acceleration based on transformed input
    this.acceleration.set(
      worldX * this.speed,
      0,
      worldZ * this.speed // Already transformed to world coordinates
    );

    // Apply acceleration to velocity
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));

    // Apply friction
    this.velocity.multiplyScalar(this.friction);

    // Clamp velocity to max speed
    if (this.velocity.lengthSq() > this.maxSpeed * this.maxSpeed) {
      this.velocity.normalize().multiplyScalar(this.maxSpeed);
    }

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Update mesh position
    this.mesh.position.copy(this.position);

    // Reset acceleration
    this.acceleration.set(0, 0, 0);
  }

  /**
   * Get player position
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get player mesh
   */
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Check collision with other objects
   */
  public checkCollision(objects: THREE.Object3D[]): boolean {
    // This will be implemented when we add the collision system
    return false;
  }
}

// Singleton instance
let playerInstance: Player | null = null;

/**
 * Initialize the player
 */
export function initPlayer(): Player {
  if (!playerInstance) {
    playerInstance = new Player();
  }
  return playerInstance;
}

/**
 * Get the player instance
 */
export function getPlayer(): Player {
  if (!playerInstance) {
    throw new Error('Player not initialized');
  }
  return playerInstance;
}
