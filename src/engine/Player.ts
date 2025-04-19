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
   * Transform input axes based on camera rotation
   * This makes WASD movement relative to the camera view
   * W always moves in the direction the camera is facing
   */
  private transformInputAxes(inputX: number, inputY: number): { x: number, z: number } {
    // Get the camera rotation angle
    const renderer = getRenderer();
    const cameraAngle = renderer.camera.getRotationAngle();

    // For our control scheme:
    // - W (inputY = 1) should move in the direction the camera is facing
    // - A (inputX = -1) should move left relative to camera
    // - S (inputY = -1) should move backward relative to camera
    // - D (inputX = 1) should move right relative to camera

    // In Three.js, the camera rotation works as follows (based on our coordinate system):
    // - PI radians: Camera looks north (-X axis)
    // - PI/2 radians: Camera looks east (+Z axis)
    // - 0 radians: Camera looks south (+X axis)
    // - 3PI/2 radians: Camera looks west (-Z axis)

    // We need to map our WASD inputs to the world coordinates based on camera angle
    // First, we'll determine the forward and right vectors based on camera angle
    const forwardX = -Math.cos(cameraAngle); // X component of forward vector
    const forwardZ = Math.sin(cameraAngle);  // Z component of forward vector

    const rightX = -Math.sin(cameraAngle);   // X component of right vector
    const rightZ = -Math.cos(cameraAngle);   // Z component of right vector

    // Now combine the forward and right vectors based on input
    // Forward/backward movement (W/S) uses the forward vector
    // Left/right movement (A/D) uses the right vector
    const worldX = (inputY * forwardX) + (inputX * rightX);
    const worldZ = (inputY * forwardZ) + (inputX * rightZ);

    return { x: worldX, z: worldZ };
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
      -worldZ * this.speed // Negative because forward is -z in Three.js
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
