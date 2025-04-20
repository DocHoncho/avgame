import { IWorld } from 'bitecs';
import { getRenderer } from '../engine/Renderer';
import { getPlayer } from '../engine/Player';
import { initWorld, getWorld, createPipeline } from './world';
import { movementSystem, collisionSystem, renderSystem, showEcsEntities } from './systems';
import { createPlayerEntity, createObstacleEntity } from './index';
import * as THREE from 'three';

// The ECS pipeline
let ecsPipeline: (world: IWorld, dt: number) => IWorld;

// The player entity ID
let playerEntityId: number | null = null;

/**
 * Initialize the ECS system and integrate it with the existing game
 * @param visible Whether ECS entities should be visible (default: false)
 */
export function initECS(visible: boolean = false): void {
  // Set the visibility flag
  showEcsEntities = visible;
  try {
    // Initialize the ECS world
    const world = initWorld();
    console.log('ECS world initialized:', world);

    // Create the pipeline
    ecsPipeline = createPipeline([
      movementSystem,
      collisionSystem,
      // renderSystem is called separately with the scene
    ]);

    // Get the renderer and scene
    const renderer = getRenderer();
    const scene = renderer.scene;

    // Create a player entity at the same position as the existing player
    const player = getPlayer();
    const playerPos = player.getPosition();

    // Create the player entity
    try {
      playerEntityId = createPlayerEntity(playerPos.x, playerPos.y, playerPos.z);
      console.log(`ECS initialized with player entity ID: ${playerEntityId}`);
    } catch (error) {
      console.error('Error creating player entity:', error);
    }
  } catch (error) {
    console.error('Error initializing ECS:', error);
  }
}

/**
 * Update the ECS world
 * @param dt Delta time in seconds
 */
export function updateECS(dt: number): void {
  if (!ecsPipeline) {
    console.warn('ECS not initialized. Call initECS() first.');
    return;
  }

  try {
    const world = getWorld();

    // Run the ECS pipeline
    ecsPipeline(world, dt);

    // Run the render system with the scene
    const renderer = getRenderer();
    renderSystem(world, dt, renderer.scene);

    // Sync the player entity with the existing player
    syncPlayerWithECS();
  } catch (error) {
    console.error('Error updating ECS world:', error);
    throw error; // Re-throw to be caught by the game loop
  }
}

/**
 * Sync the player entity with the existing player object
 * This is a temporary function until we fully migrate to ECS
 */
function syncPlayerWithECS(): void {
  if (!playerEntityId) return;

  const world = getWorld();
  const player = getPlayer();

  // Get the player position
  const playerPos = player.getPosition();

  // Update the ECS player entity position
  // This will be removed once we fully migrate to ECS
  // import { Transform } from './components';
  // Transform.x[playerEntityId] = playerPos.x;
  // Transform.y[playerEntityId] = playerPos.y;
  // Transform.z[playerEntityId] = playerPos.z;
}

/**
 * Toggle the visibility of ECS entities
 * @param visible Whether ECS entities should be visible
 */
export function setEcsEntitiesVisible(visible: boolean): void {
  showEcsEntities = visible;
  console.log(`ECS entities are now ${visible ? 'visible' : 'hidden'}`);
}

/**
 * Create test obstacles in the ECS world
 * This is for testing purposes only
 */
export function createTestObstacles(): void {
  try {
    // Create some test obstacles
    createObstacleEntity(-3, 0.5, -3); // North room obstacle
    createObstacleEntity(3, 0.5, -3);  // North room obstacle

    // South room obstacles (2x2 square)
    createObstacleEntity(-2, 0.5, 3);
    createObstacleEntity(-1, 0.5, 3);
    createObstacleEntity(-2, 0.5, 4);
    createObstacleEntity(-1, 0.5, 4);

    console.log('Test obstacles created in ECS world');
  } catch (error) {
    console.error('Error creating test obstacles:', error);
  }
}
