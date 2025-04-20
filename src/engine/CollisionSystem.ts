import * as THREE from 'three';

/**
 * Represents an Axis-Aligned Bounding Box (AABB) for collision detection
 */
export interface AABB {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

/**
 * Represents a capsule collider for the player
 */
export interface Capsule {
  start: THREE.Vector3;  // Bottom center of capsule
  end: THREE.Vector3;    // Top center of capsule
  radius: number;        // Radius of capsule
}

/**
 * Collision System
 *
 * Handles collision detection and resolution between entities in the game.
 */
export class CollisionSystem {
  // Static colliders (walls, obstacles)
  private staticColliders: AABB[] = [];

  constructor() {
    // Initialize with empty colliders
  }

  /**
   * Add a static collider to the system
   */
  public addStaticCollider(collider: AABB): void {
    this.staticColliders.push(collider);
  }

  /**
   * Clear all static colliders
   */
  public clearStaticColliders(): void {
    this.staticColliders = [];
  }

  /**
   * Generate AABB colliders from wall instances
   * @param wallInstances The instanced mesh containing wall objects
   * @param tileSize The size of each tile
   */
  public generateWallColliders(wallInstances: THREE.InstancedMesh, tileSize: number): void {
    // Clear existing colliders
    this.clearStaticColliders();

    // Create a matrix to store each instance's transform
    const matrix = new THREE.Matrix4();

    // Process each wall instance
    for (let i = 0; i < wallInstances.count; i++) {
      // Get the transform matrix for this instance
      wallInstances.getMatrixAt(i, matrix);

      // Extract position from matrix
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(matrix);

      // Create an AABB for this wall
      // The wall is centered at its position, so we need to calculate min/max
      const halfSize = tileSize / 2;
      const min = new THREE.Vector3(
        position.x - halfSize,
        position.y - 0.5, // Wall height is 1.0, centered at y=0.5
        position.z - halfSize
      );

      const max = new THREE.Vector3(
        position.x + halfSize,
        position.y + 0.5,
        position.z + halfSize
      );

      // Add the collider
      this.addStaticCollider({ min, max });
    }

    console.log(`Generated ${this.staticColliders.length} wall colliders`);
  }

  /**
   * Check if a point is inside an AABB
   */
  private isPointInAABB(point: THREE.Vector3, aabb: AABB): boolean {
    return (
      point.x >= aabb.min.x && point.x <= aabb.max.x &&
      point.y >= aabb.min.y && point.y <= aabb.max.y &&
      point.z >= aabb.min.z && point.z <= aabb.max.z
    );
  }

  /**
   * Check if a sphere intersects with an AABB
   */
  private sphereIntersectsAABB(center: THREE.Vector3, radius: number, aabb: AABB): boolean {
    // Find the closest point on the AABB to the sphere center
    const closestPoint = new THREE.Vector3(
      Math.max(aabb.min.x, Math.min(center.x, aabb.max.x)),
      Math.max(aabb.min.y, Math.min(center.y, aabb.max.y)),
      Math.max(aabb.min.z, Math.min(center.z, aabb.max.z))
    );

    // Calculate squared distance between the closest point and sphere center
    const distanceSquared = closestPoint.distanceToSquared(center);

    // If the distance is less than the radius squared, they intersect
    return distanceSquared <= (radius * radius);
  }

  /**
   * Check if a capsule intersects with an AABB
   */
  private capsuleIntersectsAABB(capsule: Capsule, aabb: AABB): boolean {
    // For simplicity, we'll check if either end of the capsule (as a sphere)
    // intersects with the AABB
    return (
      this.sphereIntersectsAABB(capsule.start, capsule.radius, aabb) ||
      this.sphereIntersectsAABB(capsule.end, capsule.radius, aabb)
    );
  }

  /**
   * Check if a capsule would intersect with any static collider after moving
   * @returns Array of colliders that would be intersected
   */
  public checkCapsuleCollision(capsule: Capsule): AABB[] {
    const collisions: AABB[] = [];

    for (const collider of this.staticColliders) {
      if (this.capsuleIntersectsAABB(capsule, collider)) {
        collisions.push(collider);
      }
    }

    return collisions;
  }

  /**
   * Resolve collisions between a capsule and multiple AABBs by calculating a sliding vector
   * @param capsule The capsule collider
   * @param velocity The current velocity vector
   * @param colliders Array of AABB colliders that were hit
   * @returns A modified velocity vector that slides along the surfaces
   */
  public resolveCollisions(
    capsule: Capsule,
    velocity: THREE.Vector3,
    colliders: AABB[]
  ): THREE.Vector3 {
    if (colliders.length === 0) {
      return velocity.clone();
    }

    // Create a copy of the velocity to modify
    let newVelocity = velocity.clone();

    // Handle each collider
    for (const collider of colliders) {
      // Find the closest point on the AABB to the capsule center
      const closestPoint = new THREE.Vector3(
        Math.max(collider.min.x, Math.min(capsule.start.x, collider.max.x)),
        Math.max(collider.min.y, Math.min(capsule.start.y, collider.max.y)),
        Math.max(collider.min.z, Math.min(capsule.start.z, collider.max.z))
      );

      // Calculate the penetration vector (from closest point to capsule center)
      const penetration = new THREE.Vector3().subVectors(capsule.start, closestPoint);
      const penetrationDistance = penetration.length();

      // If we're actually penetrating (accounting for radius)
      if (penetrationDistance < capsule.radius) {
        // Normalize the penetration vector
        if (penetrationDistance > 0) {
          penetration.normalize();
        } else {
          // If penetration distance is 0 (rare case), use a default direction
          // This happens when the capsule center is exactly on the AABB surface
          penetration.set(1, 0, 0);
        }

        // Calculate the dot product of velocity and penetration
        const dot = newVelocity.dot(penetration);

        // If the dot product is negative, the velocity is going into the collider
        if (dot < 0) {
          // Project the velocity onto the penetration vector
          const projection = penetration.clone().multiplyScalar(dot);

          // Subtract the projection from the velocity to get the sliding vector
          newVelocity.sub(projection);

          // Add a small push-out vector to prevent sticking to walls
          const pushFactor = 0.01; // Small push to prevent sticking
          const pushVector = penetration.clone().multiplyScalar(pushFactor);
          newVelocity.add(pushVector);
        }
      }
    }

    // For corner cases, if we have multiple collisions and the resulting velocity is very small,
    // we might be stuck. In that case, add a small push-out vector in the average direction
    if (colliders.length > 1 && newVelocity.lengthSq() < 0.01) {
      // Calculate average push direction from all colliders
      const avgPushDir = new THREE.Vector3();

      for (const collider of colliders) {
        const center = new THREE.Vector3().addVectors(collider.min, collider.max).multiplyScalar(0.5);
        const pushDir = new THREE.Vector3().subVectors(capsule.start, center).normalize();
        avgPushDir.add(pushDir);
      }

      if (avgPushDir.lengthSq() > 0) {
        avgPushDir.normalize().multiplyScalar(0.05); // Small push
        newVelocity.add(avgPushDir);
      }
    }

    return newVelocity;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use resolveCollisions instead
   */
  public resolveCollision(
    capsule: Capsule,
    velocity: THREE.Vector3,
    collider: AABB
  ): THREE.Vector3 {
    return this.resolveCollisions(capsule, velocity, [collider]);
  }

  /**
   * Get all static colliders
   */
  public getStaticColliders(): AABB[] {
    return this.staticColliders;
  }

  /**
   * Create debug visualization for colliders
   * @param scene The Three.js scene to add the visualization to
   */
  public createDebugVisualization(scene: THREE.Scene): void {
    // Remove any existing debug visualization
    this.removeDebugVisualization(scene);

    // Create a wireframe material for the debug visualization
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });

    // Create a box for each collider
    for (const collider of this.staticColliders) {
      // Calculate the size and position of the box
      const size = new THREE.Vector3().subVectors(collider.max, collider.min);
      const position = new THREE.Vector3().addVectors(collider.min, collider.max).multiplyScalar(0.5);

      // Create the box geometry
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

      // Create the mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.name = 'debug-collider';

      // Add the mesh to the scene
      scene.add(mesh);
    }

    console.log(`Created debug visualization for ${this.staticColliders.length} colliders`);
  }

  /**
   * Remove debug visualization from the scene
   * @param scene The Three.js scene to remove the visualization from
   */
  public removeDebugVisualization(scene: THREE.Scene): void {
    // Find and remove all debug collider meshes
    const toRemove: THREE.Object3D[] = [];

    scene.traverse((object) => {
      if (object.name === 'debug-collider') {
        toRemove.push(object);
      }
    });

    for (const object of toRemove) {
      scene.remove(object);

      // Dispose of geometry and material
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            for (const material of object.material) {
              material.dispose();
            }
          } else {
            object.material.dispose();
          }
        }
      }
    }

    if (toRemove.length > 0) {
      console.log(`Removed ${toRemove.length} debug collider visualizations`);
    }
  }
}

// Singleton instance
let collisionSystemInstance: CollisionSystem | null = null;

/**
 * Initialize the collision system
 */
export function initCollisionSystem(): CollisionSystem {
  if (!collisionSystemInstance) {
    collisionSystemInstance = new CollisionSystem();
  }
  return collisionSystemInstance;
}

/**
 * Get the collision system instance
 */
export function getCollisionSystem(): CollisionSystem {
  if (!collisionSystemInstance) {
    throw new Error('Collision system not initialized');
  }
  return collisionSystemInstance;
}
