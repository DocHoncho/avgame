import * as bitecs from 'bitecs';

const {
  createWorld,
  addEntity,
  removeEntity,
  pipe,
  defineQuery
} = bitecs;

type IWorld = ReturnType<typeof createWorld>;

/**
 * The ECS world instance
 * This is the central object that holds all entities and components
 */
let world: IWorld | null = null;

/**
 * Entities that are scheduled for deletion at the end of the current frame
 */
const entitiesToDelete: number[] = [];

/**
 * Initialize the ECS world
 * @returns The newly created world
 */
export function initWorld(): IWorld {
  if (world) {
    console.warn('ECS world already initialized, resetting');
  }

  world = createWorld();

  // Add a reference to the entities to delete
  // This is not a standard bitecs feature, but it's useful for deferred deletion
  (world as any).entitiesToDelete = entitiesToDelete;

  // Expose for debugging in development
  if (import.meta.env.DEV) {
    (window as any).__ecsWorld = world;
  }

  return world;
}

/**
 * Get the current ECS world
 * @returns The current world
 * @throws Error if the world is not initialized
 */
export function getWorld(): IWorld {
  if (!world) {
    throw new Error('ECS world not initialized. Call initWorld() first.');
  }
  return world;
}

/**
 * Reset the ECS world, removing all entities and components
 */
export function resetWorld(): void {
  world = null;
  entitiesToDelete.length = 0;
}

/**
 * Create a new entity in the world
 * @returns The entity ID
 */
export function createEntity(): number {
  const world = getWorld();

  try {
    // In bitecs, addEntity returns the entity ID
    const eid = addEntity(world);

    // Debug log
    console.log(`Created entity with ID: ${eid}`);

    if (eid === undefined) {
      throw new Error('Failed to create entity. Entity is undefined.');
    }

    return eid;
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
}

/**
 * Schedule an entity for deletion at the end of the current frame
 * @param entity The entity ID to delete
 */
export function scheduleEntityForDeletion(entity: number): void {
  entitiesToDelete.push(entity);
}

/**
 * Process all entities scheduled for deletion
 * This should be called at the end of each frame
 */
export function processEntityDeletions(): void {
  const currentWorld = getWorld();

  for (const entity of entitiesToDelete) {
    removeEntity(currentWorld, entity);
  }

  // Clear the array for the next frame
  entitiesToDelete.length = 0;
}

/**
 * Create a pipeline of systems to run each frame
 * @param systems Array of system functions to run in order
 * @returns A function that runs all systems when called with the world
 */
export function createPipeline(systems: Array<(world: IWorld, dt: number) => void>) {
  return (world: IWorld, dt: number) => {
    for (const system of systems) {
      system(world, dt);
    }

    // Process entity deletions at the end of the frame
    processEntityDeletions();

    return world;
  };
}
