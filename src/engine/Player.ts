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
  private speed: number = 5.0;
  private maxSpeed: number = 8.0;
  private friction: number = 0.85;
  
  // Collision properties
  private radius: number = 0.4;
  private height: number = 1.8;
  
  constructor() {
    // Initialize position and physics vectors
    this.position = new THREE.Vector3(8, 0.9, 8);
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
   * Update player state
   */
  public update(deltaTime: number): void {
    // Get input axes
    const { x: moveX, y: moveY } = inputManager.getMovementAxes();
    
    // Apply acceleration based on input
    // Note: In isometric view, we need to transform the input directions
    // to match the world space directions
    this.acceleration.set(
      moveX * this.speed,
      0,
      -moveY * this.speed // Negative because forward is -z in Three.js
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
