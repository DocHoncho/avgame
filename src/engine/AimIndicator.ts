import * as THREE from 'three';
import { getRenderer } from './Renderer';
import { inputManager } from './InputManager';
import { getPlayer } from './Player';

/**
 * AimIndicator
 * 
 * Visual indicator for the player's aim direction.
 * Shows where the player is aiming based on mouse position.
 */
export class AimIndicator {
  // Indicator mesh
  private mesh: THREE.Mesh;
  
  // Line from player to aim point
  private line: THREE.Line;
  
  // Aim distance
  private aimDistance: number = 5.0;
  
  constructor() {
    // Create indicator mesh (a small cylinder)
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.7
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = Math.PI / 2; // Rotate to lay flat
    
    // Create line geometry
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(6); // 2 points * 3 coordinates
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5
    });
    
    this.line = new THREE.Line(lineGeometry, lineMaterial);
    
    // Add to scene
    const renderer = getRenderer();
    renderer.scene.add(this.mesh);
    renderer.scene.add(this.line);
  }
  
  /**
   * Update the aim indicator position based on mouse position
   */
  public update(): void {
    // Get player position
    const player = getPlayer();
    const playerPos = player.getPosition();
    
    // Get mouse world position
    const mouseWorldPos = inputManager.getMouseWorldPosition();
    
    if (mouseWorldPos.x !== 0 || mouseWorldPos.z !== 0) {
      // Calculate direction from player to mouse
      const dirX = mouseWorldPos.x - playerPos.x;
      const dirZ = mouseWorldPos.z - playerPos.z;
      
      // Normalize direction
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
      if (length > 0) {
        const normalizedDirX = dirX / length;
        const normalizedDirZ = dirZ / length;
        
        // Set indicator position at a fixed distance from player
        const targetX = playerPos.x + normalizedDirX * this.aimDistance;
        const targetZ = playerPos.z + normalizedDirZ * this.aimDistance;
        
        // Update mesh position
        this.mesh.position.set(targetX, 0.05, targetZ);
        
        // Update line positions
        const positions = this.line.geometry.attributes.position.array as Float32Array;
        
        // Start point (player position)
        positions[0] = playerPos.x;
        positions[1] = 0.5; // Slightly above ground
        positions[2] = playerPos.z;
        
        // End point (aim indicator)
        positions[3] = targetX;
        positions[4] = 0.05;
        positions[5] = targetZ;
        
        // Mark positions as needing update
        this.line.geometry.attributes.position.needsUpdate = true;
      }
    }
  }
  
  /**
   * Get the aim direction as a normalized vector
   */
  public getAimDirection(): THREE.Vector2 {
    const player = getPlayer();
    const playerPos = player.getPosition();
    const mouseWorldPos = inputManager.getMouseWorldPosition();
    
    const dirX = mouseWorldPos.x - playerPos.x;
    const dirZ = mouseWorldPos.z - playerPos.z;
    
    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (length > 0) {
      return new THREE.Vector2(dirX / length, dirZ / length);
    }
    
    // Default forward direction if no valid aim
    return new THREE.Vector2(0, -1);
  }
}

// Singleton instance
let aimIndicatorInstance: AimIndicator | null = null;

/**
 * Initialize the aim indicator
 */
export function initAimIndicator(): AimIndicator {
  if (!aimIndicatorInstance) {
    aimIndicatorInstance = new AimIndicator();
  }
  return aimIndicatorInstance;
}

/**
 * Get the aim indicator instance
 */
export function getAimIndicator(): AimIndicator {
  if (!aimIndicatorInstance) {
    throw new Error('AimIndicator not initialized');
  }
  return aimIndicatorInstance;
}
