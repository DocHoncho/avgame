// Re-export everything from the ECS module
export * from './world';
export * from './components';
export * from './systems';

// Export a convenience function to create a basic entity
import { createEntity } from './world';
import { 
  addTransform, 
  addVelocity, 
  addCollider, 
  addRenderable,
  CollisionFlags
} from './components';

/**
 * Create a basic entity with common components
 * 
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param options Additional options for the entity
 * @returns The entity ID
 */
export function createBasicEntity(
  x = 0, 
  y = 0, 
  z = 0,
  options: {
    rotY?: number;
    velocity?: { dx: number; dy: number; dz: number };
    collider?: { radius: number; height: number; flags: number };
    renderable?: { meshType: number; materialType: number };
  } = {}
) {
  const entity = createEntity();
  
  // Add transform component
  addTransform(entity, x, y, z, options.rotY || 0);
  
  // Add velocity component if specified
  if (options.velocity) {
    addVelocity(
      entity,
      options.velocity.dx,
      options.velocity.dy,
      options.velocity.dz
    );
  }
  
  // Add collider component if specified
  if (options.collider) {
    addCollider(
      entity,
      options.collider.radius,
      options.collider.height,
      options.collider.flags
    );
  }
  
  // Add renderable component if specified
  if (options.renderable) {
    addRenderable(
      entity,
      options.renderable.meshType,
      options.renderable.materialType
    );
  }
  
  return entity;
}

/**
 * Create a player entity
 * 
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @returns The entity ID
 */
export function createPlayerEntity(x = 0, y = 0.9, z = 0) {
  return createBasicEntity(x, y, z, {
    velocity: { dx: 0, dy: 0, dz: 0 },
    collider: { 
      radius: 0.5, 
      height: 1.8, 
      flags: CollisionFlags.PLAYER | CollisionFlags.OBSTACLE 
    },
    renderable: { meshType: 2, materialType: 1 } // Capsule with blue material
  });
}

/**
 * Create a static obstacle entity
 * 
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param size Size of the obstacle (default: 1)
 * @returns The entity ID
 */
export function createObstacleEntity(x = 0, y = 0.5, z = 0, size = 1) {
  return createBasicEntity(x, y, z, {
    collider: { 
      radius: size / 2, 
      height: 0, 
      flags: CollisionFlags.STATIC | CollisionFlags.OBSTACLE 
    },
    renderable: { meshType: 0, materialType: 2 } // Box with green material
  });
}
