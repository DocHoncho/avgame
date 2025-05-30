import * as THREE from 'three';

/**
 * IsoCamera
 *
 * Specialized camera for isometric view with rotation and zoom controls.
 * Maintains a fixed 3/4 perspective angle.
 */
export class IsoCamera {
  // The actual Three.js camera
  public camera: THREE.PerspectiveCamera;

  // Camera target (what we're looking at)
  private target = new THREE.Vector3(0, 0, 0);

  // Camera position in spherical coordinates
  private distance = 20;
  private rotationAngle = Math.PI / 2;
  private elevationAngle = Math.PI / 6; // 30 degrees

  // Camera limits
  private minDistance = 10;
  private maxDistance = 50;
  private minElevation = Math.PI / 12; // 15 degrees
  private maxElevation = Math.PI / 3;  // 60 degrees

  constructor(fov = 50, aspect = 1, near = 0.1, far = 1000) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.updatePosition();
  }

  /**
   * Update camera aspect ratio (on window resize)
   */
  setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set the target position (what the camera looks at)
   */
  setTarget(x: number, y: number, z: number) {
    this.target.set(x, y, z);
    this.updatePosition();
  }

  /**
   * Rotate the camera around the target
   */
  rotate(deltaAngle: number) {
    this.rotationAngle += deltaAngle;
    this.updatePosition();
  }

  /**
   * Change the camera elevation angle
   */
  elevate(deltaAngle: number) {
    this.elevationAngle = Math.max(
      this.minElevation,
      Math.min(this.maxElevation, this.elevationAngle + deltaAngle)
    );
    this.updatePosition();
  }

  /**
   * Zoom the camera in/out
   */
  zoom(delta: number) {
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance + delta)
    );
    this.updatePosition();
  }

  /**
   * Set the camera distance directly
   */
  setDistance(distance: number) {
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, distance)
    );
    this.updatePosition();
  }

  /**
   * Get the current rotation angle
   */
  getRotationAngle(): number {
    return this.rotationAngle;
  }

  /**
   * Get the forward vector of the camera (in the XZ plane)
   * @returns Normalized forward vector
   */
  getForwardVector(): THREE.Vector3 {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    // Project onto XZ plane and normalize
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  /**
   * Get the right vector of the camera (in the XZ plane)
   * @returns Normalized right vector
   */
  getRightVector(): THREE.Vector3 {
    const forward = this.getForwardVector();
    // Right vector is perpendicular to forward in the XZ plane
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    return right;
  }

  /**
   * Snap to one of the four cardinal isometric views
   * @param index 0=North, 1=East, 2=South, 3=West
   */
  snapToCardinal(index: number) {
    // Define the angles for each cardinal direction based on Three.js coordinates
    // North = PI/2 (looking at -Z), East = 0 (looking at +X)
    // South = 3PI/2 (looking at +Z), West = PI (looking at -X)
    const angles = [
      Math.PI / 2,   // 0 North  (‑Z)
      Math.PI,       // 1 East   (+X)
      3 * Math.PI / 2,//2 South  (+Z)
      0              // 3 West   (‑X)
    ];    this.rotationAngle = angles[index % 4];
    this.updatePosition();

    // Debug log for camera direction
    console.log(`Camera snapped to ${['North', 'East', 'South', 'West'][index % 4]} (${this.rotationAngle} radians)`);
  }

  /**
   * Update the camera position based on spherical coordinates
   */
  private updatePosition() {
    // Calculate position from spherical coordinates
    const x = this.target.x + this.distance * Math.cos(this.elevationAngle) * Math.cos(this.rotationAngle);
    const z = this.target.z + this.distance * Math.cos(this.elevationAngle) * Math.sin(this.rotationAngle);
    const y = this.target.y + this.distance * Math.sin(this.elevationAngle);

    // Update camera position and orientation
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
    this.camera.updateProjectionMatrix();
  }
}
