import * as THREE from 'three';
import { IsoCamera } from './IsoCamera';

/**
 * Renderer
 *
 * Manages the Three.js rendering pipeline, including:
 * - Scene setup and management
 * - Post-processing effects (bloom, edge glow)
 * - Instanced tile rendering
 */
export class Renderer {
  // Three.js core objects
  private renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene; // Public so other systems can add objects
  public camera: IsoCamera;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  // Tile grid
  private floorInstances: THREE.InstancedMesh | null = null;
  private wallInstances: THREE.InstancedMesh | null = null;
  private tileSize = 1.0;
  private roomSize = 12; // 12x12 room with 1-tile wall border

  // Performance monitoring
  private stats = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0
  };

  constructor(canvas: HTMLCanvasElement) {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000814);
    this.renderer.shadowMap.enabled = true;

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new IsoCamera(50, window.innerWidth / window.innerHeight);
    this.camera.setTarget(this.roomSize / 2, 0, this.roomSize / 2);

    // Set initial camera distance for better view
    this.camera.setDistance(18);

    // Add lights
    this.ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    // Set up shadow properties
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;

    // Create grid
    this.createTestGrid();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Expose for debugging in dev mode
    if (import.meta.env.DEV) {
      (window as any).__renderer = this;
    }
  }

  /**
   * Create a test grid of instanced tiles
   */
  private createTestGrid() {
    // Create floor tile geometry (slightly thinner)
    const floorGeometry = new THREE.BoxGeometry(this.tileSize, 0.1, this.tileSize);

    // Create wall geometry (taller)
    const wallGeometry = new THREE.BoxGeometry(this.tileSize, 1.0, this.tileSize);

    // Create floor material with edge glow effect
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x005588,
      emissive: 0x001122,
      metalness: 0.7,
      roughness: 0.3
    });

    // Create wall material with different color
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x0088cc,
      emissive: 0x003366,
      metalness: 0.8,
      roughness: 0.2
    });

    // Calculate total tiles needed
    const totalFloorTiles = (this.roomSize - 2) * (this.roomSize - 2); // Interior floor
    const totalWallTiles = (this.roomSize * this.roomSize) - totalFloorTiles; // Outer walls

    // Create instanced meshes
    this.floorInstances = new THREE.InstancedMesh(
      floorGeometry,
      floorMaterial,
      totalFloorTiles
    );
    this.floorInstances.castShadow = false;
    this.floorInstances.receiveShadow = true;

    this.wallInstances = new THREE.InstancedMesh(
      wallGeometry,
      wallMaterial,
      totalWallTiles
    );
    this.wallInstances.castShadow = true;
    this.wallInstances.receiveShadow = true;

    // Position matrix
    const matrix = new THREE.Matrix4();

    // Place floor tiles (interior)
    let floorIndex = 0;
    for (let x = 1; x < this.roomSize - 1; x++) {
      for (let z = 1; z < this.roomSize - 1; z++) {
        // Center the room at origin
        const posX = (x - this.roomSize / 2) * this.tileSize;
        const posZ = (z - this.roomSize / 2) * this.tileSize;

        matrix.setPosition(posX, 0, posZ);
        this.floorInstances.setMatrixAt(floorIndex, matrix);

        // Set uniform color for floor
        const floorColor = new THREE.Color(0x005588);
        this.floorInstances.setColorAt(floorIndex, floorColor);

        floorIndex++;
      }
    }

    // Place wall tiles (perimeter)
    let wallIndex = 0;
    for (let x = 0; x < this.roomSize; x++) {
      for (let z = 0; z < this.roomSize; z++) {
        // Only place walls on the perimeter
        if (x === 0 || x === this.roomSize - 1 || z === 0 || z === this.roomSize - 1) {
          // Center the room at origin
          const posX = (x - this.roomSize / 2) * this.tileSize;
          const posZ = (z - this.roomSize / 2) * this.tileSize;

          matrix.setPosition(posX, 0.5, posZ); // Walls are centered at y=0.5
          this.wallInstances.setMatrixAt(wallIndex, matrix);

          // Set uniform color for walls
          const wallColor = new THREE.Color(0x0088cc);
          this.wallInstances.setColorAt(wallIndex, wallColor);

          wallIndex++;
        }
      }
    }

    // Add instances to scene
    this.scene.add(this.floorInstances);
    this.scene.add(this.wallInstances);

    // Add a grid helper for reference (centered at origin)
    const gridHelper = new THREE.GridHelper(this.roomSize, this.roomSize);
    this.scene.add(gridHelper);
  }

  /**
   * Handle window resize
   */
  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.setAspect(width / height);
    this.renderer.setSize(width, height);
  }

  /**
   * Render the scene
   */
  render() {
    // Update performance stats
    const startTime = performance.now();

    // Render the scene
    this.renderer.render(this.scene, this.camera.camera);

    // Update stats
    this.stats.frameTime = performance.now() - startTime;
    this.stats.drawCalls = this.renderer.info.render.calls;
  }

  /**
   * Rotate the camera around the scene
   */
  rotateCamera(deltaAngle: number) {
    this.camera.rotate(deltaAngle);
  }

  /**
   * Get current performance stats
   */
  getStats() {
    return this.stats;
  }
}

// Singleton instance
let rendererInstance: Renderer | null = null;

/**
 * Initialize the renderer
 */
export function initRenderer(): Renderer {
  if (!rendererInstance) {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    rendererInstance = new Renderer(canvas);
  }
  return rendererInstance;
}

/**
 * Get the renderer instance
 */
export function getRenderer(): Renderer {
  if (!rendererInstance) {
    throw new Error('Renderer not initialized');
  }
  return rendererInstance;
}
