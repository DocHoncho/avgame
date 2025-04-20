import * as bitecs from 'bitecs';

const {
  defineComponent,
  addComponent
} = bitecs;

const { f32, u8, u16 } = bitecs.Types;

/**
 * Transform component
 * Stores the position and rotation of an entity
 */
export const Transform = defineComponent({
  // Position
  x: f32,
  y: f32,
  z: f32,
  // Rotation (only Y-axis rotation for now, in radians)
  rotY: f32
});

/**
 * Velocity component
 * Stores the velocity vector of an entity
 */
export const Velocity = defineComponent({
  // Velocity vector
  dx: f32,
  dy: f32,
  dz: f32
});

/**
 * Collider component
 * Stores collision information for an entity
 */
export const Collider = defineComponent({
  // Radius for capsule/sphere colliders
  radius: f32,
  // Height for capsule colliders (0 for sphere)
  height: f32,
  // Collision flags (bit mask)
  // Bit 0: Is static (doesn't move)
  // Bit 1: Is trigger (doesn't block movement)
  // Bit 2: Is player (special handling)
  // Bit 3: Is obstacle (can be collided with)
  flags: u8
});

/**
 * Renderable component
 * Stores rendering information for an entity
 */
export const Renderable = defineComponent({
  // Mesh type (index into a mesh registry)
  meshType: u16,
  // Material type (index into a material registry)
  materialType: u16
});

/**
 * Collision flags
 */
export const CollisionFlags = {
  STATIC: 1 << 0,   // 1
  TRIGGER: 1 << 1,  // 2
  PLAYER: 1 << 2,   // 4
  OBSTACLE: 1 << 3  // 8
};

/**
 * Helper function to add a Transform component to an entity
 */
export function addTransform(
  entity: number,
  x = 0,
  y = 0,
  z = 0,
  rotY = 0
) {
  if (entity === undefined) {
    throw new Error('Cannot add Transform component to undefined entity');
  }

  try {
    addComponent(Transform, entity);
    Transform.x[entity] = x;
    Transform.y[entity] = y;
    Transform.z[entity] = z;
    Transform.rotY[entity] = rotY;
    return entity;
  } catch (error) {
    console.error(`Error adding Transform component to entity ${entity}:`, error);
    throw error;
  }
}

/**
 * Helper function to add a Velocity component to an entity
 */
export function addVelocity(
  entity: number,
  dx = 0,
  dy = 0,
  dz = 0
) {
  if (entity === undefined) {
    throw new Error('Cannot add Velocity component to undefined entity');
  }

  try {
    addComponent(Velocity, entity);
    Velocity.dx[entity] = dx;
    Velocity.dy[entity] = dy;
    Velocity.dz[entity] = dz;
    return entity;
  } catch (error) {
    console.error(`Error adding Velocity component to entity ${entity}:`, error);
    throw error;
  }
}

/**
 * Helper function to add a Collider component to an entity
 */
export function addCollider(
  entity: number,
  radius = 0.5,
  height = 0,
  flags = CollisionFlags.OBSTACLE
) {
  if (entity === undefined) {
    throw new Error('Cannot add Collider component to undefined entity');
  }

  try {
    addComponent(Collider, entity);
    Collider.radius[entity] = radius;
    Collider.height[entity] = height;
    Collider.flags[entity] = flags;
    return entity;
  } catch (error) {
    console.error(`Error adding Collider component to entity ${entity}:`, error);
    throw error;
  }
}

/**
 * Helper function to add a Renderable component to an entity
 */
export function addRenderable(
  entity: number,
  meshType = 0,
  materialType = 0
) {
  if (entity === undefined) {
    throw new Error('Cannot add Renderable component to undefined entity');
  }

  try {
    addComponent(Renderable, entity);
    Renderable.meshType[entity] = meshType;
    Renderable.materialType[entity] = materialType;
    return entity;
  } catch (error) {
    console.error(`Error adding Renderable component to entity ${entity}:`, error);
    throw error;
  }
}
