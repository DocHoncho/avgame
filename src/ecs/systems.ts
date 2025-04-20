import { IWorld, defineQuery, enterQuery, exitQuery } from 'bitecs';
import { Transform, Velocity, Collider, Renderable, CollisionFlags } from './components';
import * as THREE from 'three';
import { getCollisionSystem, Capsule } from '../engine/CollisionSystem';

/**
 * Query for entities with Transform and Velocity components
 */
const movementQuery = defineQuery([Transform, Velocity]);

/**
 * Query for entities with Transform and Collider components
 */
const collisionQuery = defineQuery([Transform, Collider]);

/**
 * Query for entities with Transform and Renderable components
 */
const renderableQuery = defineQuery([Transform, Renderable]);

/**
 * Query for entities that just got a Transform and Renderable component
 */
const enterRenderableQuery = enterQuery(renderableQuery);

/**
 * Query for entities that just lost a Transform or Renderable component
 */
const exitRenderableQuery = exitQuery(renderableQuery);

/**
 * Movement system
 * Updates entity positions based on their velocity
 */
export function movementSystem(world: IWorld, dt: number) {
  const entities = movementQuery(world);
  
  for (const entity of entities) {
    // Apply velocity to position
    Transform.x[entity] += Velocity.dx[entity] * dt;
    Transform.y[entity] += Velocity.dy[entity] * dt;
    Transform.z[entity] += Velocity.dz[entity] * dt;
  }
  
  return world;
}

/**
 * Collision system
 * Handles collision detection and resolution
 */
export function collisionSystem(world: IWorld, dt: number) {
  const entities = collisionQuery(world);
  const collisionSys = getCollisionSystem();
  
  for (const entity of entities) {
    // Skip static entities
    if (Collider.flags[entity] & CollisionFlags.STATIC) {
      continue;
    }
    
    // Skip entities without velocity
    if (!Velocity.dx[entity] && !Velocity.dy[entity] && !Velocity.dz[entity]) {
      continue;
    }
    
    // Create a capsule collider for the entity
    const capsule: Capsule = {
      start: new THREE.Vector3(
        Transform.x[entity],
        Transform.y[entity] - Collider.height[entity] / 2 + Collider.radius[entity],
        Transform.z[entity]
      ),
      end: new THREE.Vector3(
        Transform.x[entity],
        Transform.y[entity] + Collider.height[entity] / 2 - Collider.radius[entity],
        Transform.z[entity]
      ),
      radius: Collider.radius[entity]
    };
    
    // Check for collisions
    const colliders = collisionSys.checkCapsuleCollision(capsule);
    
    if (colliders.length > 0) {
      // Create a velocity vector
      const velocity = new THREE.Vector3(
        Velocity.dx[entity],
        Velocity.dy[entity],
        Velocity.dz[entity]
      );
      
      // Resolve collisions
      const newVelocity = collisionSys.resolveCollisions(capsule, velocity, colliders);
      
      // Update entity velocity
      Velocity.dx[entity] = newVelocity.x;
      Velocity.dy[entity] = newVelocity.y;
      Velocity.dz[entity] = newVelocity.z;
    }
  }
  
  return world;
}

/**
 * Mesh registry
 * Maps mesh types to THREE.Geometry or mesh creation functions
 */
const meshRegistry: Record<number, THREE.BufferGeometry | (() => THREE.BufferGeometry)> = {
  0: new THREE.BoxGeometry(1, 1, 1), // Default cube
  1: new THREE.SphereGeometry(0.5, 16, 16), // Sphere
  2: new THREE.CapsuleGeometry(0.5, 1, 8, 16) // Capsule
};

/**
 * Material registry
 * Maps material types to THREE.Material or material creation functions
 */
const materialRegistry: Record<number, THREE.Material | (() => THREE.Material)> = {
  0: new THREE.MeshStandardMaterial({ color: 0x888888 }), // Default gray
  1: new THREE.MeshStandardMaterial({ color: 0x00aaff }), // Blue
  2: new THREE.MeshStandardMaterial({ color: 0x00cc88 }) // Green
};

/**
 * Map of entity IDs to their THREE.Mesh objects
 */
const entityMeshes = new Map<number, THREE.Mesh>();

/**
 * Render system
 * Updates the visual representation of entities
 */
export function renderSystem(world: IWorld, dt: number, scene: THREE.Scene) {
  // Handle entities that just got renderable components
  const newRenderables = enterRenderableQuery(world);
  for (const entity of newRenderables) {
    const meshType = Renderable.meshType[entity];
    const materialType = Renderable.materialType[entity];
    
    // Get or create geometry
    let geometry: THREE.BufferGeometry;
    const meshDef = meshRegistry[meshType];
    if (meshDef instanceof THREE.BufferGeometry) {
      geometry = meshDef;
    } else if (typeof meshDef === 'function') {
      geometry = meshDef();
    } else {
      geometry = meshRegistry[0] as THREE.BufferGeometry; // Default
    }
    
    // Get or create material
    let material: THREE.Material;
    const materialDef = materialRegistry[materialType];
    if (materialDef instanceof THREE.Material) {
      material = materialDef;
    } else if (typeof materialDef === 'function') {
      material = materialDef();
    } else {
      material = materialRegistry[0] as THREE.Material; // Default
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Set initial position
    mesh.position.set(
      Transform.x[entity],
      Transform.y[entity],
      Transform.z[entity]
    );
    
    // Set initial rotation
    mesh.rotation.y = Transform.rotY[entity];
    
    // Add to scene
    scene.add(mesh);
    
    // Store reference
    entityMeshes.set(entity, mesh);
  }
  
  // Update positions and rotations of all renderable entities
  const renderables = renderableQuery(world);
  for (const entity of renderables) {
    const mesh = entityMeshes.get(entity);
    if (mesh) {
      // Update position
      mesh.position.set(
        Transform.x[entity],
        Transform.y[entity],
        Transform.z[entity]
      );
      
      // Update rotation
      mesh.rotation.y = Transform.rotY[entity];
    }
  }
  
  // Handle entities that lost renderable components
  const removedRenderables = exitRenderableQuery(world);
  for (const entity of removedRenderables) {
    const mesh = entityMeshes.get(entity);
    if (mesh) {
      // Remove from scene
      scene.remove(mesh);
      
      // Dispose of geometry and material
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          for (const material of mesh.material) {
            material.dispose();
          }
        } else {
          mesh.material.dispose();
        }
      }
      
      // Remove reference
      entityMeshes.delete(entity);
    }
  }
  
  return world;
}
