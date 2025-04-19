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
  private tileInstances: THREE.InstancedMesh | null = null;
  private tileSize = 1.0;
  private gridSize = 16; // 16x16 test grid

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
    this.camera.setTarget(this.gridSize / 2, 0, this.gridSize / 2);

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
    // Create a simple tile geometry
    const tileGeometry = new THREE.BoxGeometry(this.tileSize, 0.2, this.tileSize);

    // Create material with edge glow effect
    const tileMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x003366,
      metalness: 0.8,
      roughness: 0.2
    });

    // Create instanced mesh for the grid
    this.tileInstances = new THREE.InstancedMesh(
      tileGeometry,
      tileMaterial,
      this.gridSize * this.gridSize
    );
    this.tileInstances.castShadow = true;
    this.tileInstances.receiveShadow = true;

    // Position each instance
    const matrix = new THREE.Matrix4();
    let index = 0;

    for (let x = 0; x < this.gridSize; x++) {
      for (let z = 0; z < this.gridSize; z++) {
        // Checkerboard pattern for testing
        const isEven = (x + z) % 2 === 0;
        const height = isEven ? 0 : 0.5;

        matrix.setPosition(x * this.tileSize, height, z * this.tileSize);
        this.tileInstances.setMatrixAt(index, matrix);

        // Set color based on position
        const color = new THREE.Color(
          0.3 + (x / this.gridSize) * 0.7,
          0.2,
          0.3 + (z / this.gridSize) * 0.7
        );
        this.tileInstances.setColorAt(index, color);

        index++;
      }
    }

    this.scene.add(this.tileInstances);

    // Add a grid helper for reference
    const gridHelper = new THREE.GridHelper(this.gridSize, this.gridSize);
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
