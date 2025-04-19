import * as THREE from 'three';
import { getRenderer } from './Renderer';

/**
 * WorldRay utility
 * 
 * Provides functions for raycasting from screen to world coordinates.
 * Used for mouse aiming, object picking, and collision detection.
 */
export class WorldRay {
  // Raycaster instance
  private static raycaster = new THREE.Raycaster();
  
  // Temporary objects to avoid garbage collection
  private static mouseVector = new THREE.Vector2();
  private static intersectionPoint = new THREE.Vector3();
  
  /**
   * Cast a ray from screen coordinates to the world
   * 
   * @param screenX Screen X coordinate (e.g., mouse.clientX)
   * @param screenY Screen Y coordinate (e.g., mouse.clientY)
   * @param targetObjects Objects to check for intersection
   * @returns Array of intersections sorted by distance
   */
  public static castRay(
    screenX: number, 
    screenY: number, 
    targetObjects: THREE.Object3D[] | THREE.Object3D
  ): THREE.Intersection[] {
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    this.mouseVector.x = (screenX / window.innerWidth) * 2 - 1;
    this.mouseVector.y = -(screenY / window.innerHeight) * 2 + 1;
    
    // Get the camera
    const renderer = getRenderer();
    const camera = renderer.camera.camera;
    
    // Update the raycaster
    this.raycaster.setFromCamera(this.mouseVector, camera);
    
    // Cast the ray
    return this.raycaster.intersectObjects(
      Array.isArray(targetObjects) ? targetObjects : [targetObjects], 
      true
    );
  }
  
  /**
   * Get the intersection point with a horizontal plane at the specified Y coordinate
   * 
   * @param screenX Screen X coordinate
   * @param screenY Screen Y coordinate
   * @param planeY Y coordinate of the horizontal plane
   * @returns Intersection point or null if no intersection
   */
  public static getIntersectionWithHorizontalPlane(
    screenX: number, 
    screenY: number, 
    planeY: number = 0
  ): THREE.Vector3 | null {
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    this.mouseVector.x = (screenX / window.innerWidth) * 2 - 1;
    this.mouseVector.y = -(screenY / window.innerHeight) * 2 + 1;
    
    // Get the camera
    const renderer = getRenderer();
    const camera = renderer.camera.camera;
    
    // Update the raycaster
    this.raycaster.setFromCamera(this.mouseVector, camera);
    
    // Create a horizontal plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    
    // Check for intersection
    if (this.raycaster.ray.intersectPlane(plane, this.intersectionPoint)) {
      return this.intersectionPoint.clone();
    }
    
    return null;
  }
  
  /**
   * Get the world position for the mouse cursor
   * 
   * @param mouseX Mouse X coordinate
   * @param mouseY Mouse Y coordinate
   * @param groundY Y coordinate of the ground plane
   * @returns World position or null if no intersection
   */
  public static getMouseWorldPosition(
    mouseX: number, 
    mouseY: number, 
    groundY: number = 0
  ): { x: number, y: number, z: number } | null {
    const intersection = this.getIntersectionWithHorizontalPlane(mouseX, mouseY, groundY);
    
    if (intersection) {
      return {
        x: intersection.x,
        y: intersection.y,
        z: intersection.z
      };
    }
    
    return null;
  }
}
